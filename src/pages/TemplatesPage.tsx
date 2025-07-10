import { useState, useEffect } from 'react';
import { useTemplatesStore } from '../stores';
import { PrimaryButton, OutlineButton } from '../components/ui/standardButtons';
import { Card, CardContent } from '../components/ui/card';
import type { Template } from '../lib/types';
import IconBench from '../components/icons/icon-bench';
import { TemplateForm } from '../components/TemplateForm';
import { TemplateList } from '../components/TemplateList';

type ViewMode = 'list' | 'create' | 'edit';

export function TemplatesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Subscribe to store state and actions
  const templates = useTemplatesStore(state => state.templates);
  const isLoading = useTemplatesStore(state => state.isLoading);
  const error = useTemplatesStore(state => state.error);
  const initializeTemplates = useTemplatesStore(
    state => state.initializeTemplates
  );
  const createTemplate = useTemplatesStore(state => state.createTemplate);
  const updateTemplate = useTemplatesStore(state => state.updateTemplate);
  const deleteTemplate = useTemplatesStore(state => state.deleteTemplate);

  // Initialize templates on mount
  useEffect(() => {
    initializeTemplates();
  }, [initializeTemplates]);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setViewMode('create');
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setViewMode('edit');
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
  };

  const handleSaveTemplate = async (
    templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingTemplate) {
      // Update existing template
      await updateTemplate(editingTemplate.id, templateData);
    } else {
      // Create new template
      await createTemplate(templateData);
    }

    // Return to list view
    setViewMode('list');
    setEditingTemplate(null);
  };

  const handleCancelEdit = () => {
    setViewMode('list');
    setEditingTemplate(null);
  };

  // Show form when creating or editing
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {viewMode === 'create' ? 'Create Template' : 'Edit Template'}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === 'create'
              ? 'Create a reusable workout template'
              : 'Update your workout template'}
          </p>
        </div>

        <TemplateForm
          onSave={handleSaveTemplate}
          editTemplate={editingTemplate}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  // Show list view
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Workout Templates</h1>
            <p className="text-muted-foreground">
              Pre-built workout templates to get you started quickly
            </p>
          </div>
          <PrimaryButton onClick={handleCreateTemplate} size="sm">
            Create Template
          </PrimaryButton>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-lg font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
              <OutlineButton onClick={() => window.location.reload()}>
                Reload
              </OutlineButton>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">
                <IconBench className="size-10 animate-pulse" />
              </div>
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && !isLoading && templates.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 lg:py-12 flex flex-col items-center justify-center">
              <h2 className="text-xl lg:text-2xl font-semibold mb-2 flex items-center gap-2">
                <IconBench className="size-10" />
                No Templates Yet
              </h2>
              <p className="text-muted-foreground mb-4 text-sm lg:text-base">
                Create your first workout template to get started!
              </p>
              <p className="text-xs lg:text-sm text-muted-foreground mb-4">
                Templates are reusable workout blueprints that you can apply
                when creating new workouts.
              </p>
              <PrimaryButton onClick={handleCreateTemplate}>
                Create Template
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && !isLoading && templates.length > 0 && (
        <TemplateList
          templates={templates}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
        />
      )}
    </div>
  );
}
