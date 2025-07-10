import { useState } from 'react';
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  DestructiveButton,
  GhostButton,
} from '@/components/ui/standardButtons';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { TagGroup } from '@/components/ui/Tag';
import type { Template } from '@/lib/types';
import IconBench from './icons/icon-bench';
import IconDumbbell from './icons/icon-dumbbell';
import IconTimer from './icons/icon-timer';
import IconDelete from './icons/icon-delete';
import IconGear from './icons/icon-gear';
import IconMagnifier from './icons/icon-magnifier';

interface TemplateListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
}

export function TemplateList({
  templates,
  onEdit,
  onDelete,
}: TemplateListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(
    new Set(templates.map(t => t.category).filter(Boolean))
  ).sort();

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      template.exercises.some(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      !categoryFilter || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      onDelete(templateToDelete);
      setTemplateToDelete(null);
    }
  };

  const cancelDelete = () => {
    setTemplateToDelete(null);
  };

  const formatExercisePreview = (template: Template): string => {
    const exerciseCount = template.exercises.length;
    if (exerciseCount === 0) return 'No exercises';
    if (exerciseCount === 1) return template.exercises[0].name;
    if (exerciseCount <= 3) {
      return template.exercises.map(ex => ex.name).join(', ');
    }
    return `${template.exercises
      .slice(0, 2)
      .map(ex => ex.name)
      .join(', ')} + ${exerciseCount - 2} more`;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search Templates</Label>
              <div className="relative mt-1">
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by name, description, or exercises..."
                  className="pl-10"
                />
                <IconMagnifier className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <Label>Filter by Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                  placeholder="All Categories"
                >
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category!}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
          </div>

          {(searchTerm || categoryFilter) && (
            <div className="mt-4">
              <OutlineButton
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                }}
              >
                Clear Filters
              </OutlineButton>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <IconBench className="size-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
              <p className="text-muted-foreground text-sm">
                {searchTerm || categoryFilter
                  ? 'No templates match your current filters.'
                  : 'No templates available.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {filteredTemplates.map(template => (
            <Card
              key={template.id}
              className="hover:shadow-md transition-shadow flex flex-col"
              onClick={() => onEdit(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {template.name}
                    </CardTitle>
                    {template.category && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {template.category}
                        {template.isBuiltIn && (
                          <span className="ml-2 text-primary font-medium">
                            Built-in
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <GhostButton
                      size="sm"
                      onClick={() => onEdit(template)}
                      className="p-2"
                    >
                      <IconGear className="size-4" />
                    </GhostButton>
                    {!template.isBuiltIn && (
                      <GhostButton
                        size="sm"
                        onClick={() => handleDeleteClick(template.id)}
                        className="p-2 text-destructive hover:text-destructive"
                      >
                        <IconDelete className="size-4" />
                      </GhostButton>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="space-y-4">
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconDumbbell className="size-4" />
                      <span>{template.exercises.length} exercises</span>
                    </div>
                    {template.estimatedDuration && (
                      <div className="flex items-center gap-1">
                        <IconTimer className="size-4" />
                        <span>{template.estimatedDuration} min</span>
                      </div>
                    )}
                    {template.usageCount > 0 && (
                      <div className="text-xs">
                        Used {template.usageCount} times
                      </div>
                    )}
                  </div>

                  {/* Exercise Preview */}
                  <div className="text-xs text-muted-foreground">
                    <strong>Exercises:</strong>{' '}
                    {formatExercisePreview(template)}
                  </div>

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <TagGroup
                      tags={template.tags}
                      variant="default"
                      size="sm"
                      maxVisible={3}
                    />
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-4">
                <div className="flex gap-2 w-full">
                  <OutlineButton
                    size="sm"
                    onClick={() => onEdit(template)}
                    className="flex-1"
                  >
                    Edit
                  </OutlineButton>
                  <PrimaryButton
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // TODO: Implement template application logic
                      console.log('Apply template:', template.name);
                    }}
                  >
                    Use Template
                  </PrimaryButton>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-sm mx-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Delete Template</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete this template? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <SecondaryButton onClick={cancelDelete} size="sm">
                  Cancel
                </SecondaryButton>
                <DestructiveButton onClick={confirmDelete} size="sm">
                  Delete
                </DestructiveButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
