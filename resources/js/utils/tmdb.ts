export function getTmdbImageUrl(
    path: string | null,
    size: string = 'w500',
): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = 'https://image.tmdb.org/t/p/';
    return `${baseUrl}${size}${path}`;
}
