<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

class EmailReportService
{
    private const REPORT_PATH = 'reports/email-report.json';

    private const CHUNK_SIZE = 20000;

    private const INVALID_SAMPLE_SIZE = 100;

    public function __construct(private EmailDomainClassifier $classifier)
    {
    }

    public function latest(): ?array
    {
        $disk = Storage::disk('local');

        if (! $disk->exists(self::REPORT_PATH)) {
            return null;
        }

        return json_decode($disk->get(self::REPORT_PATH), true);
    }

    public function generate(bool $checkMx = false, int $mxLimit = 40): array
    {
        $startedAt = microtime(true);

        $domains = [];
        $invalidSamples = [];
        $totalUsers = 0;
        $invalidFormat = 0;

        User::query()->select(['id', 'email'])->chunkByIdDesc(self::CHUNK_SIZE, function ($users) use (&$domains, &$invalidSamples, &$totalUsers, &$invalidFormat): void {
            foreach ($users as $user) {
                $totalUsers++;
                $email = (string) $user->email;

                if (! $this->classifier->isValidFormat($email)) {
                    $invalidFormat++;

                    if (count($invalidSamples) < self::INVALID_SAMPLE_SIZE) {
                        $invalidSamples[] = ['id' => $user->id, 'email' => $email];
                    }

                    continue;
                }

                $domain = $this->classifier->domainOf($email);
                $domains[$domain] = ($domains[$domain] ?? 0) + 1;
            }
        });

        arsort($domains);

        $counts = [
            EmailDomainClassifier::POPULAR => 0,
            EmailDomainClassifier::TYPO => 0,
            EmailDomainClassifier::DISPOSABLE => 0,
            EmailDomainClassifier::OTHER => 0,
        ];
        $gmail = 0;
        $topDomains = [];
        $typos = [];
        $disposable = [];
        $others = [];

        foreach ($domains as $domain => $total) {
            [$category, $suggestion] = $this->classifier->classify($domain);
            $counts[$category] += $total;

            if (in_array($domain, EmailDomainClassifier::GMAIL_DOMAINS, true)) {
                $gmail += $total;
            }

            if (count($topDomains) < 20) {
                $topDomains[] = ['domain' => $domain, 'total' => $total, 'category' => $category];
            }

            match ($category) {
                EmailDomainClassifier::TYPO => $typos[] = ['domain' => $domain, 'total' => $total, 'suggestion' => $suggestion],
                EmailDomainClassifier::DISPOSABLE => $disposable[] = ['domain' => $domain, 'total' => $total],
                EmailDomainClassifier::OTHER => $others[] = ['domain' => $domain, 'total' => $total, 'mx' => null],
                default => null,
            };
        }

        $others = array_slice($others, 0, 40);
        $noMxEmails = null;

        if ($checkMx) {
            $noMxEmails = 0;

            foreach ($others as $index => $row) {
                if ($index >= $mxLimit) {
                    break;
                }

                $hasMx = $this->hasMailServer($row['domain']);
                $others[$index]['mx'] = $hasMx;

                if (! $hasMx) {
                    $noMxEmails += $row['total'];
                }
            }
        }

        $report = [
            'generated_at' => now()->toIso8601String(),
            'duration_seconds' => round(microtime(true) - $startedAt, 1),
            'totals' => [
                'users' => $totalUsers,
                'valid_format' => $totalUsers - $invalidFormat,
                'invalid_format' => $invalidFormat,
                'popular' => $counts[EmailDomainClassifier::POPULAR],
                'gmail' => $gmail,
                'typo' => $counts[EmailDomainClassifier::TYPO],
                'disposable' => $counts[EmailDomainClassifier::DISPOSABLE],
                'other' => $counts[EmailDomainClassifier::OTHER],
                'distinct_domains' => count($domains),
                'no_mx' => $noMxEmails,
            ],
            'top_domains' => $topDomains,
            'typos' => array_slice($typos, 0, 40),
            'disposable' => array_slice($disposable, 0, 30),
            'others' => $others,
            'invalid_samples' => $invalidSamples,
        ];

        Storage::disk('local')->put(self::REPORT_PATH, json_encode($report, JSON_UNESCAPED_UNICODE));

        return $report;
    }

    private function hasMailServer(string $domain): bool
    {
        return checkdnsrr($domain . '.', 'MX') || checkdnsrr($domain . '.', 'A');
    }
}
