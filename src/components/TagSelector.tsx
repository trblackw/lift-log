import { useState } from 'react';
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
} from '@/components/ui/standardButtons';
import { FormInput } from '@/components/ui/standardInputs';
import { Label } from '@/components/ui/label';
import { Tag, TagGroup, tagUtils } from '@/components/ui/Tag';
import type { Tag as TagType } from '@/lib/types';

interface TagSelectorProps {
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
}

const predefinedTags: TagType[] = [
  {
    id: 'strength',
    name: 'Strength',
    color: tagUtils.generateTagColor('Strength'),
  },
  { id: 'cardio', name: 'Cardio', color: tagUtils.generateTagColor('Cardio') },
  {
    id: 'upper-body',
    name: 'Upper Body',
    color: tagUtils.generateTagColor('Upper Body'),
  },
  {
    id: 'lower-body',
    name: 'Lower Body',
    color: tagUtils.generateTagColor('Lower Body'),
  },
  {
    id: 'full-body',
    name: 'Full Body',
    color: tagUtils.generateTagColor('Full Body'),
  },
  { id: 'push', name: 'Push', color: tagUtils.generateTagColor('Push') },
  { id: 'pull', name: 'Pull', color: tagUtils.generateTagColor('Pull') },
  { id: 'legs', name: 'Legs', color: tagUtils.generateTagColor('Legs') },
];

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [newTagName, setNewTagName] = useState('');

  const toggleTag = (tag: TagType) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    if (!newTagName.trim()) return;

    const customTag: TagType = {
      id: crypto.randomUUID(),
      name: newTagName.trim(),
      color: tagUtils.getRandomTagColor(),
    };

    onTagsChange([...selectedTags, customTag]);
    setNewTagName('');
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <Label className="text-sm lg:text-base mb-3 block">Tags</Label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <TagGroup
          tags={selectedTags}
          variant="removable"
          size="sm"
          onTagRemove={removeTag}
        />
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
                className="h-10 lg:h-12 text-xs lg:text-sm font-medium cursor-pointer"
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
          <FormInput
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
