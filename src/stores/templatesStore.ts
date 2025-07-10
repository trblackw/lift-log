import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { storage } from '../lib/storage';
import type { Template } from '../lib/types';
import { toast } from 'sonner';

interface TemplatesStore {
  // State
  templates: Template[];
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeTemplates: () => Promise<void>;
  createTemplate: (
    template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  searchTemplates: (query: string) => Promise<Template[]>;
  getTemplatesByCategory: (category: string) => Promise<Template[]>;
  useTemplate: (id: string) => Promise<Template | null>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useTemplatesStore = create<TemplatesStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      templates: [],
      isLoading: false,
      error: null,

      // Initialize templates from storage
      initializeTemplates: async () => {
        try {
          set({ isLoading: true, error: null });

          const templates = await storage.loadTemplates();
          set({ templates, isLoading: false });

          console.log('✅ Templates initialized:', templates.length);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to load templates';
          console.error('❌ Failed to initialize templates:', error);
          set({ error: errorMessage, isLoading: false });
        }
      },

      // Create a new template
      createTemplate: async templateData => {
        try {
          set({ isLoading: true, error: null });

          const now = new Date();
          const template: Template = {
            ...templateData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            usageCount: 0,
            isBuiltIn: false,
          };

          await storage.saveTemplate(template);

          const updatedTemplates = [...get().templates, template];
          set({ templates: updatedTemplates, isLoading: false });

          toast.success('Template created successfully');
          console.log('✅ Template created:', template.name);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to create template';
          console.error('❌ Failed to create template:', error);
          set({ error: errorMessage, isLoading: false });
          toast.error('Failed to create template');
        }
      },

      // Update an existing template
      updateTemplate: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });

          const currentTemplates = get().templates;
          const templateIndex = currentTemplates.findIndex(t => t.id === id);

          if (templateIndex === -1) {
            throw new Error('Template not found');
          }

          const updatedTemplate: Template = {
            ...currentTemplates[templateIndex],
            ...updates,
            updatedAt: new Date(),
          };

          await storage.saveTemplate(updatedTemplate);

          const updatedTemplates = [...currentTemplates];
          updatedTemplates[templateIndex] = updatedTemplate;

          set({ templates: updatedTemplates, isLoading: false });

          toast.success('Template updated successfully');
          console.log('✅ Template updated:', updatedTemplate.name);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to update template';
          console.error('❌ Failed to update template:', error);
          set({ error: errorMessage, isLoading: false });
          toast.error('Failed to update template');
        }
      },

      // Delete a template
      deleteTemplate: async id => {
        try {
          set({ isLoading: true, error: null });

          const currentTemplates = get().templates;
          const template = currentTemplates.find(t => t.id === id);

          if (!template) {
            throw new Error('Template not found');
          }

          // Prevent deletion of built-in templates
          if (template.isBuiltIn) {
            throw new Error('Cannot delete built-in templates');
          }

          await storage.deleteTemplate(id);

          const updatedTemplates = currentTemplates.filter(t => t.id !== id);
          set({ templates: updatedTemplates, isLoading: false });

          toast.success('Template deleted successfully');
          console.log('✅ Template deleted:', template.name);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to delete template';
          console.error('❌ Failed to delete template:', error);
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      // Search templates
      searchTemplates: async query => {
        try {
          if (!query.trim()) {
            return get().templates;
          }

          return await storage.searchTemplates(query);
        } catch (error) {
          console.error('❌ Failed to search templates:', error);
          return [];
        }
      },

      // Get templates by category
      getTemplatesByCategory: async category => {
        try {
          return await storage.getTemplatesByCategory(category);
        } catch (error) {
          console.error('❌ Failed to get templates by category:', error);
          return [];
        }
      },

      // Use a template (increment usage count and return template)
      useTemplate: async id => {
        try {
          const template = get().templates.find(t => t.id === id);

          if (!template) {
            return null;
          }

          // Increment usage count in storage
          await storage.incrementTemplateUsage(id);

          // Update local state
          const currentTemplates = get().templates;
          const templateIndex = currentTemplates.findIndex(t => t.id === id);

          if (templateIndex !== -1) {
            const updatedTemplates = [...currentTemplates];
            updatedTemplates[templateIndex] = {
              ...updatedTemplates[templateIndex],
              usageCount: (updatedTemplates[templateIndex].usageCount || 0) + 1,
              updatedAt: new Date(),
            };
            set({ templates: updatedTemplates });
          }

          return template;
        } catch (error) {
          console.error('❌ Failed to use template:', error);
          return null;
        }
      },

      // Set error state
      setError: error => set({ error }),

      // Set loading state
      setLoading: isLoading => set({ isLoading }),
    }),
    {
      name: 'templates-store',
    }
  )
);
