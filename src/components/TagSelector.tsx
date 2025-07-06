import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tag } from "@/lib/types";

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const predefinedTags: Tag[] = [
  { id: 'strength', name: 'Strength', color: '#ef4444' },
  { id: 'cardio', name: 'Cardio', color: '#22c55e' },
  { id: 'upper-body', name: 'Upper Body', color: '#3b82f6' },
  { id: 'lower-body', name: 'Lower Body', color: '#f59e0b' },
  { id: 'full-body', name: 'Full Body', color: '#8b5cf6' },
  { id: 'push', name: 'Push', color: '#ec4899' },
  { id: 'pull', name: 'Pull', color: '#06b6d4' },
  { id: 'legs', name: 'Legs', color: '#84cc16' },
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
    <div className="space-y-4">
      <Label className="text-sm">Tags</Label>
      
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-1 px-2 rounded-md text-sm text-white h-8"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-1 w-1 text-white cursor-pointer hover:text-white/50 hover:bg-red/20 ml-1"
                onClick={() => removeTag(tag.id)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Predefined Tags */}
      <div>
        <Label className="text-xs text-muted-foreground">Quick Select:</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {predefinedTags.map((tag) => {
            const isSelected = selectedTags.some(t => t.id === tag.id);
            return (
              <Button
                key={tag.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTag(tag)}
                className="h-10 text-xs font-medium cursor-pointer"
                disabled={isSelected}
              >
                {tag.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Custom Tag Input */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Create Custom Tag:</Label>
        <div className="flex gap-2">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Custom tag name"
            onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
            className="h-10 text-sm"
          />
          <Button
            type="button"
            onClick={addCustomTag}
            disabled={!newTagName.trim()}
            size="sm"
            className="h-10 px-4"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
} 