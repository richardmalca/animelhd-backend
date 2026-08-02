export function normalizeForComparison(text: string): string {
    // Unicode-aware: strips punctuation only, keeping letters from any script (e.g. Japanese titles).
    return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/-{2,}/g, '-');
}

const RATING_RULES: [test: (r: string) => boolean, result: string][] = [
    [(r) => r.includes('pg-13') || r.includes('pg_13') || r.includes('teens') || r.includes('mayores de 13'), 'Apto para mayores de 13 años'],
    [(r) => r === 'g' || r.includes('all ages') || r.includes('todos los públicos'), 'Apto para todos los públicos'],
    [(r) => r === 'pg' || r.includes('children') || r.includes('niños'), 'Apto para niños'],
    [(r) => r === 'r' || r.includes('17+') || (r.includes('mayores de 17') && !r.includes('restringido')), 'Apto para mayores de 17 años'],
    [(r) => r === 'r+' || r.includes('restringido') || r.includes('mild nudity'), 'Apto para mayores de 17 años (Restringido)'],
    [(r) => r === 'rx' || r.includes('hentai') || r.includes('adults') || r.includes('adultos'), 'Contenido para adultos'],
];

export function normalizeRating(rating: string): string {
    if (!rating) return 'Selecciona una clasificación';

    const clean = rating.toLowerCase().trim();
    const rule = RATING_RULES.find(([test]) => test(clean));

    return rule ? rule[1] : 'Selecciona una clasificación';
}

/** Splits MAL's comma-joined alt titles and dedupes near-identical entries, keeping all of MAL's variants. */
export function expandAltTitles(rawTitles: string[]): string[] {
    const expanded = rawTitles.flatMap((t) => (t.includes(',') ? t.split(',').map((s) => s.trim()) : [t.trim()])).filter(Boolean);

    return expanded.filter(
        (item, index) => expanded.findIndex((t) => normalizeForComparison(t) === normalizeForComparison(item)) === index,
    );
}
