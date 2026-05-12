import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
    placeholder?: string;
}

export function TagInput({ tags, setTags, placeholder = 'Añadir...' }: TagInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const value = inputValue.trim().replace(/,/g, '');
            if (value && !tags.includes(value)) {
                setTags([...tags, value]);
                setInputValue('');
            }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 p-2 border border-input rounded-md min-h-[42px] focus-within:ring-1 focus-within:ring-ring focus-within:border-ring bg-background transition-colors">
                {tags.map((tag, index) => (
                    <Badge 
                        key={index} 
                        variant="secondary" 
                        className="flex items-center gap-1 py-0 px-2 h-7 font-mono text-xs border-transparent hover:bg-secondary/80"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:text-destructive transition-colors"
                        >
                            <X className="size-3" />
                        </button>
                    </Badge>
                ))}
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground py-1"
                />
            </div>
        </div>
    );
}
