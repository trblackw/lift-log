import { useState } from 'react';
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
} from '@/components/ui/standardButtons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tag } from '@/lib/types';

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const predefinedTags: Tag[] = [
  { id: 'strength', name: 'Strength', color: '#71717a' },
  { id: 'cardio', name: 'Cardio', color: '#78716c' },
  { id: 'upper-body', name: 'Upper Body', color: '#6b7280' },
  { id: 'lower-body', name: 'Lower Body', color: '#737373' },
  { id: 'full-body', name: 'Full Body', color: '#6b7280' },
  { id: 'push', name: 'Push', color: '#78716c' },
  { id: 'pull', name: 'Pull', color: '#71717a' },
  { id: 'legs', name: 'Legs', color: '#737373' },
];

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [newTagName, setNewTagName] = useState('');

  const toggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    if (!newTagName.trim()) return;

    const customTag: Tag = {
      id: crypto.randomUUID(),
      name: newTagName.trim(),
      color: '#6b7280',
    };

    onTagsChange([...selectedTags, customTag]);
    setNewTagName('');
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <Label className="text-sm lg:text-base">Tags</Label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 lg:gap-3">
          {selectedTags.map(tag => (
            <div
              key={tag.id}
              className="flex items-center gap-1 px-2 py-0 h-8 rounded-full text-sm lg:text-base text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <GhostButton
                type="button"
                size="sm"
                className="p-0 text-white hover:bg-white/20 ml-1"
                onClick={() => removeTag(tag.id)}
              >
                ×
              </GhostButton>
            </div>
          ))}
        </div>
      )}

      {/* Predefined Tags */}
      <div>
        <Label className="text-xs lg:text-sm text-muted-foreground">
          Quick Select:
        </Label>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-3 mt-2">
          {predefinedTags.map(tag => {
            const isSelected = selectedTags.some(t => t.id === tag.id);
            const ButtonComponent = isSelected ? PrimaryButton : OutlineButton;
            return (
              <ButtonComponent
                key={tag.id}
                type="button"
                size="sm"
                onClick={() => toggleTag(tag)}
                className="h-10 lg:h-12 text-xs lg:text-sm font-medium"
                disabled={isSelected}
              >
                {tag.name}
              </ButtonComponent>
            );
          })}
        </div>
      </div>

      {/* Custom Tag Input */}
      <div className="space-y-2 lg:space-y-3">
        <Label className="text-xs lg:text-sm text-muted-foreground">
          Create Custom Tag:
        </Label>
        <div className="flex gap-2 lg:gap-3">
          <Input
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            placeholder="Custom tag name"
            onKeyPress={e => e.key === 'Enter' && addCustomTag()}
            className="h-10 lg:h-12 text-sm lg:text-base"
          />
          <SecondaryButton
            type="button"
            onClick={addCustomTag}
            disabled={!newTagName.trim()}
            size="sm"
            className="h-10 lg:h-12 px-4 lg:px-6 text-sm lg:text-base"
          >
            Add
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
