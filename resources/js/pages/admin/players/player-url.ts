export function playerEmbedUrl(player: any): string {
    if (!player?.code) return '';

    if (player.code.startsWith('http')) {
        return player.code;
    }

    let base = player.server?.embed || '';
    if (!/^https?:\/\//i.test(base)) {
        base = 'https://' + base.replace(/^\/+/, '');
    }
    base = base.replace(/\/+$/, '');

    if (base.includes('%%code%%')) {
        return base.replace('%%code%%', player.code);
    }

    return `${base}/e/${player.code}`;
}
