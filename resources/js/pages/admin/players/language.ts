export const LANGUAGE_ORDER = ['0', '1', '2'] as const;

export const LANGUAGE_LABELS: Record<string, string> = {
    '0': 'Subtitulado',
    '1': 'Español Latino',
    '2': 'Castellano',
};

export const LANGUAGE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
    '0': 'default',
    '1': 'secondary',
    '2': 'outline',
};

export function languageKey(languaje: any): string {
    return String(languaje ?? '2');
}

export function languageLabel(languaje: any): string {
    return LANGUAGE_LABELS[languageKey(languaje)] ?? 'Castellano';
}

export interface PlayerGroupRow {
    server: any;
    player: any | null;
}

export function groupPlayers(players: any[], servers: any[]): Array<{ key: string; label: string; rows: PlayerGroupRow[] }> {
    const playerMap = new Map<string, any>();

    for (const player of players) {
        playerMap.set(`${languageKey(player.languaje)}:${player.server_id}`, player);
    }

    return LANGUAGE_ORDER.map((key) => ({
        key,
        label: LANGUAGE_LABELS[key],
        rows: servers.map((server) => ({
            server,
            player: playerMap.get(`${key}:${server.id}`) ?? null,
        })),
    }));
}
