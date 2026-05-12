import { usePage } from '@inertiajs/react';

export function useTranslations() {
    const { translations } = usePage().props as any;

    const __ = (key: string, replacements: Record<string, string> = {}) => {
        let translation = translations[key] || key;

        Object.keys(replacements).forEach((r) => {
            translation = translation.replace(`:${r}`, replacements[r]);
        });

        return translation;
    };

    return { __ };
}
