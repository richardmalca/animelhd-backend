<?php

namespace App\Services\Admin;

class EmailDomainClassifier
{
    public const POPULAR = 'popular';

    public const TYPO = 'typo';

    public const DISPOSABLE = 'disposable';

    public const OTHER = 'other';

    public const GMAIL_DOMAINS = ['gmail.com', 'googlemail.com'];

    private const EMAIL_PATTERN = '/^[a-z0-9](?:[a-z0-9._%+\-]{0,62}[a-z0-9_%+\-])?@(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/i';

    private const POPULAR_DOMAINS = [
        'gmail.com', 'googlemail.com',
        'hotmail.com', 'hotmail.es', 'hotmail.com.mx', 'hotmail.com.ar', 'hotmail.cl', 'hotmail.fr', 'hotmail.it', 'hotmail.co.uk',
        'outlook.com', 'outlook.es', 'outlook.com.mx', 'outlook.cl', 'outlook.com.ar',
        'live.com', 'live.com.mx', 'live.com.ar', 'live.cl', 'msn.com',
        'yahoo.com', 'yahoo.es', 'yahoo.com.mx', 'yahoo.com.ar', 'yahoo.com.br', 'yahoo.fr', 'yahoo.co.uk', 'ymail.com',
        'icloud.com', 'me.com', 'mac.com',
        'aol.com', 'protonmail.com', 'proton.me', 'pm.me', 'gmx.com', 'gmx.net', 'mail.com', 'email.com',
        'zoho.com', 'yandex.com', 'yandex.ru', 'mail.ru', 'qq.com', '163.com', 'terra.com', 'uol.com.br', 'bol.com.br',
    ];

    private const TYPO_TARGETS = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'protonmail.com'];

    private const DISPOSABLE_DOMAINS = [
        'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamailblock.com', 'sharklasers.com', 'grr.la',
        '10minutemail.com', 'tempmail.com', 'temp-mail.org', 'tempmailo.com', 'tempr.email', 'tempail.com', 'tempinbox.com',
        'yopmail.com', 'yopmail.fr', 'throwawaymail.com', 'trashmail.com', 'getnada.com', 'maildrop.cc', 'dispostable.com',
        'fakeinbox.com', 'mohmal.com', 'emailondeck.com', 'mintemail.com', 'mailnesia.com', 'discard.email', 'mytemp.email',
        'tmail.ws', 'burnermail.io', 'moakt.com', 'spamgourmet.com', 'dropmail.me', 'fakemail.net', 'mailcatch.com',
        'inboxkitten.com', 'harakirimail.com', 'spambog.com', 'jetable.org', 'nowmymail.com', 'emailfake.com', 'mail.tm',
        '1secmail.com', '1secmail.org', '1secmail.net', 'vomoto.com', 'pokemail.net', 'spam4.me', 'wegwerfmail.de',
        'byom.de', 'gmailnator.com', 'trbvm.com',
    ];

    public function isValidFormat(string $email): bool
    {
        return strlen($email) <= 254 && preg_match(self::EMAIL_PATTERN, $email) === 1;
    }

    public function domainOf(string $email): string
    {
        $at = strrpos($email, '@');

        return strtolower($at === false ? $email : substr($email, $at + 1));
    }

    /**
     * @return array{0: string, 1: string|null} categoría y dominio sugerido cuando es un posible error de tipeo
     */
    public function classify(string $domain): array
    {
        if (in_array($domain, self::POPULAR_DOMAINS, true)) {
            return [self::POPULAR, null];
        }

        if (in_array($domain, self::DISPOSABLE_DOMAINS, true)) {
            return [self::DISPOSABLE, null];
        }

        $suggestion = $this->typoSuggestion($domain);

        return $suggestion === null ? [self::OTHER, null] : [self::TYPO, $suggestion];
    }

    private function typoSuggestion(string $domain): ?string
    {
        if (str_starts_with($domain, 'gmail.')) {
            return 'gmail.com';
        }

        foreach (self::TYPO_TARGETS as $target) {
            if (str_starts_with($domain, $target . '.')) {
                return $target;
            }
        }

        $best = null;
        $bestDistance = 3;

        foreach (self::TYPO_TARGETS as $target) {
            $distance = levenshtein($domain, $target);

            if ($distance < $bestDistance) {
                $best = $target;
                $bestDistance = $distance;
            }
        }

        return $best;
    }
}
