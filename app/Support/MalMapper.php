<?php

namespace App\Support;

class MalMapper
{
    private const STATUS_MAP = [
        'currently_airing' => 1,
        'finished_airing' => 0,
        'not_yet_aired' => 3,
    ];

    private const BROADCAST_MAP = [
        'monday' => 1,
        'tuesday' => 2,
        'wednesday' => 3,
        'thursday' => 4,
        'friday' => 5,
        'saturday' => 6,
        'sunday' => 7,
    ];

    public static function mapStatus(?string $status): int
    {
        return self::STATUS_MAP[$status] ?? 1;
    }

    public static function mapBroadcast(?string $day): int
    {
        return self::BROADCAST_MAP[$day] ?? 0;
    }

    public static function mapAltTitles(array $data): array
    {
        $altTitles = [];
        $alternative = $data['alternative_titles'] ?? [];

        if (!empty($alternative['en'])) {
            $altTitles[] = $alternative['en'];
        }
        if (!empty($alternative['ja'])) {
            $altTitles[] = $alternative['ja'];
        }
        if (!empty($alternative['synonyms'])) {
            $altTitles = array_merge($altTitles, $alternative['synonyms']);
        }

        return array_values(array_unique($altTitles));
    }

    public static function mapPremiered(array $data): ?string
    {
        if (empty($data['start_season'])) {
            return null;
        }

        return ucfirst($data['start_season']['season']) . ' ' . $data['start_season']['year'];
    }

    public static function normalizeRating(?string $rating): string
    {
        if (!$rating) {
            return 'Selecciona una clasificación';
        }

        $clean = strtolower(trim($rating));

        if (str_contains($clean, 'pg-13') || str_contains($clean, 'pg_13') || str_contains($clean, 'teens') || str_contains($clean, 'mayores de 13')) {
            return 'Apto para mayores de 13 años';
        }

        if ($clean === 'g' || str_contains($clean, 'all ages') || str_contains($clean, 'todos los públicos')) {
            return 'Apto para todos los públicos';
        }

        if ($clean === 'pg' || str_contains($clean, 'children') || str_contains($clean, 'niños')) {
            return 'Apto para niños';
        }

        if ($clean === 'r' || str_contains($clean, '17+') || (str_contains($clean, 'mayores de 17') && !str_contains($clean, 'restringido'))) {
            return 'Apto para mayores de 17 años';
        }

        if ($clean === 'r+' || str_contains($clean, 'restringido') || str_contains($clean, 'mild nudity')) {
            return 'Apto para mayores de 17 años (Restringido)';
        }

        if ($clean === 'rx' || str_contains($clean, 'hentai') || str_contains($clean, 'adults') || str_contains($clean, 'adultos')) {
            return 'Contenido para adultos';
        }

        return 'Selecciona una clasificación';
    }
}
