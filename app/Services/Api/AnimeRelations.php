<?php

namespace App\Services\Api;

use App\Models\Anime;

class AnimeRelations
{
    private const CARD_COLUMNS = ['id', 'name', 'poster', 'slug', 'type', 'vote_average'];

    private const MAX_DEPTH = 50;

    public function resolve(Anime $anime): array
    {
        $currentId = (int) $anime->id;
        $prequelIds = $this->ids($anime->prequel);
        $sequelIds = $this->ids($anime->sequel);
        $explicitIds = $this->ids($anime->related);
        // The lookup cache belongs to this request, not to a long-lived worker.
        $records = [$currentId => $anime];
        $this->load($anime, [...$prequelIds, ...$sequelIds, ...$explicitIds], $records);

        $previous = $this->walk($anime, $prequelIds, 'prequel', $records);
        $next = $this->walk($anime, $sequelIds, 'sequel', $records);
        $excluded = array_fill_keys([$currentId, ...$prequelIds, ...$sequelIds], true);
        $relatedIds = array_values(array_filter(
            array_unique([...array_reverse($previous), ...$next, ...$explicitIds]),
            fn (int $id): bool => !isset($excluded[$id]),
        ));

        return [
            'prequel' => $this->cards($prequelIds, $records, $currentId),
            'sequel' => $this->cards($sequelIds, $records, $currentId),
            'related' => $this->cards($relatedIds, $records, $currentId),
        ];
    }

    private function walk(Anime $anime, array $frontier, string $direction, array &$records): array
    {
        $visited = [(int) $anime->id => true];
        $result = [];

        for ($depth = 0; $depth < self::MAX_DEPTH && $frontier !== []; $depth++) {
            $frontier = array_values(array_filter(
                array_unique($frontier),
                fn (int $id): bool => !isset($visited[$id]),
            ));
            $this->load($anime, $frontier, $records);
            $next = [];

            foreach ($frontier as $id) {
                $visited[$id] = true;
                $record = $records[$id] ?? null;
                if ($record === null) {
                    continue;
                }

                $result[] = $id;
                array_push($next, ...$this->ids($record->getAttribute($direction)));
            }

            $frontier = $next;
        }

        return $result;
    }

    private function load(Anime $anime, array $ids, array &$records): void
    {
        $missing = array_values(array_filter(
            array_unique($ids),
            fn (int $id): bool => !array_key_exists($id, $records),
        ));
        if ($missing === []) {
            return;
        }

        foreach ($missing as $id) {
            $records[$id] = null;
        }

        foreach ($anime->newQuery()->whereIn('id', $missing)
            ->get([...self::CARD_COLUMNS, 'prequel', 'sequel']) as $record) {
            $records[(int) $record->id] = $record;
        }
    }

    private function cards(array $ids, array $records, int $currentId): array
    {
        $cards = [];
        foreach ($ids as $id) {
            if ($id !== $currentId && ($records[$id] ?? null) !== null) {
                $cards[] = $records[$id]->only(self::CARD_COLUMNS);
            }
        }

        return $cards;
    }

    private function ids(mixed $value): array
    {
        $ids = [];
        foreach (explode(',', (string) $value) as $part) {
            $part = trim($part);
            if (!ctype_digit($part)) {
                continue;
            }
            $id = filter_var($part, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            if ($id !== false) {
                $ids[] = $id;
            }
        }

        return array_values(array_unique($ids));
    }
}
