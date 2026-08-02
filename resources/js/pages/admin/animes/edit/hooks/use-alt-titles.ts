import { useEffect, useState } from 'react';
import { normalizeForComparison } from '../utils';

type AltTitlesArgs = {
    animeNameAlternative: string | null;
    currentName: string;
    onChange: (joined: string) => void;
};

export function useAltTitles({ animeNameAlternative, currentName, onChange }: AltTitlesArgs) {
    const [altTitles, setAltTitles] = useState<string[]>(() => splitTitles(animeNameAlternative));
    const [titleInput, setTitleInput] = useState('');

    useEffect(() => {
        setAltTitles(splitTitles(animeNameAlternative));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animeNameAlternative]);

    useEffect(() => {
        onChange(altTitles.join(', '));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [altTitles]);

    const handleAddAltTitle = (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter' && e.key !== ',') return;
        e.preventDefault();

        const value = titleInput.trim();
        const currentNameNormalized = normalizeForComparison(currentName);
        const valueNormalized = normalizeForComparison(value);

        if (!value || valueNormalized === currentNameNormalized) {
            return;
        }

        const isDuplicate = altTitles.some((t) => normalizeForComparison(t) === valueNormalized);
        if (!isDuplicate) {
            setAltTitles([...altTitles, value]);
        }
        setTitleInput('');
    };

    const removeAltTitle = (title: string) => {
        setAltTitles(altTitles.filter((t) => t !== title));
    };

    return { altTitles, setAltTitles, titleInput, setTitleInput, handleAddAltTitle, removeAltTitle };
}

function splitTitles(nameAlternative: string | null): string[] {
    if (!nameAlternative) return [];

    const titles = nameAlternative
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

    return titles.filter((item, index) => titles.findIndex((t) => normalizeForComparison(t) === normalizeForComparison(item)) === index);
}
