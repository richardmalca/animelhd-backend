<?php

use App\Services\Admin\EmailDomainClassifier;
use App\Services\Admin\EmailReportService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Storage::fake('local');

    Schema::create('users', function (Blueprint $table): void {
        $table->id();
        $table->string('name')->unique();
        $table->string('email')->unique();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password')->default('');
        $table->boolean('isPremium')->default(false);
        $table->timestamps();
    });
});

function seedEmail(string $email): void
{
    DB::table('users')->insert([
        'name' => $email,
        'email' => $email,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

it('valida el formato de los correos', function (string $email, bool $valid): void {
    expect((new EmailDomainClassifier())->isValidFormat($email))->toBe($valid);
})->with([
    ['persona@gmail.com', true],
    ['persona.apellido+tag@hotmail.com.mx', true],
    ['a@b.co', true],
    ['sin-arroba.com', false],
    ['persona@', false],
    ['@gmail.com', false],
    ['per sona@gmail.com', false],
    ['persona@gmail', false],
    ['persona@gmail..com', false],
    ['persona.@gmail.com', false],
]);

it('clasifica los dominios', function (string $domain, string $category, ?string $suggestion): void {
    expect((new EmailDomainClassifier())->classify($domain))->toBe([$category, $suggestion]);
})->with([
    ['gmail.com', 'popular', null],
    ['hotmail.es', 'popular', null],
    ['mailinator.com', 'disposable', null],
    ['gmial.com', 'typo', 'gmail.com'],
    ['gmail.con', 'typo', 'gmail.com'],
    ['gmail.es', 'typo', 'gmail.com'],
    ['gmail.com.mx', 'typo', 'gmail.com'],
    ['hotmal.com', 'typo', 'hotmail.com'],
    ['outlok.com', 'typo', 'outlook.com'],
    ['miempresa.com.pe', 'other', null],
    ['unc.edu.pe', 'other', null],
]);

it('genera el reporte con los indicadores y lo guarda', function (): void {
    foreach ([
        'uno@gmail.com', 'dos@gmail.com', 'tres@hotmail.com', 'cuatro@gmial.com',
        'cinco@mailinator.com', 'seis@miempresa.com', 'siete@gmail', 'ocho sin arroba',
    ] as $email) {
        seedEmail($email);
    }

    $service = app(EmailReportService::class);

    expect($service->latest())->toBeNull();

    $report = $service->generate();

    expect($report['totals'])->toMatchArray([
        'users' => 8,
        'valid_format' => 6,
        'invalid_format' => 2,
        'popular' => 3,
        'gmail' => 2,
        'typo' => 1,
        'disposable' => 1,
        'other' => 1,
        'distinct_domains' => 5,
    ]);
    expect($report['typos'][0])->toMatchArray(['domain' => 'gmial.com', 'suggestion' => 'gmail.com']);
    expect(collect($report['invalid_samples'])->pluck('email')->sort()->values()->all())->toBe(['ocho sin arroba', 'siete@gmail']);
    expect($service->latest()['totals']['users'])->toBe(8);
});
