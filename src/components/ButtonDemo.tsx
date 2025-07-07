import { Card, CardContent } from '@/components/ui/card';
import {
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  OutlineButton,
  GhostButton,
} from '@/components/ui/standardButtons';
import { useTheme } from '@/lib/theme';
import { useColors } from '@/lib/useColors';

export function ButtonDemo() {
  const { theme, toggleTheme } = useTheme();
  const colors = useColors();

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Standardized Button Components</h1>
        <p className="text-muted-foreground">
          Centralized button definitions using our color palette
        </p>
        <OutlineButton onClick={toggleTheme}>
          Toggle Theme ({theme})
        </OutlineButton>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Button Variants */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Button Variants</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Primary Button
                </h3>
                <PrimaryButton className="w-full">Save Workout</PrimaryButton>
                <p className="text-xs text-muted-foreground">
                  Navy/Teal - Main actions like "Save", "Submit", "Create"
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Secondary Button
                </h3>
                <SecondaryButton className="w-full">Cancel</SecondaryButton>
                <p className="text-xs text-muted-foreground">
                  Teal/Mint - Secondary actions like "Cancel", "Back"
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Destructive Button
                </h3>
                <DestructiveButton className="w-full">
                  Delete Exercise
                </DestructiveButton>
                <p className="text-xs text-muted-foreground">
                  Red (#DC2525) - Dangerous actions like "Delete", "Remove"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Button Styles */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Additional Styles</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Outline Button
                </h3>
                <OutlineButton className="w-full">Edit Settings</OutlineButton>
                <p className="text-xs text-muted-foreground">
                  Border/Accent - Tertiary actions, subtle emphasis
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Ghost Button
                </h3>
                <GhostButton className="w-full">View Details</GhostButton>
                <p className="text-xs text-muted-foreground">
                  Minimal - Actions that shouldn't draw attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Groups Example */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Button Groups</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Form Actions
                </h3>
                <div className="flex gap-2">
                  <PrimaryButton>Save</PrimaryButton>
                  <SecondaryButton>Cancel</SecondaryButton>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Workout Management
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <PrimaryButton size="sm">Start Workout</PrimaryButton>
                  <OutlineButton size="sm">Edit</OutlineButton>
                  <GhostButton size="sm">Duplicate</GhostButton>
                  <DestructiveButton size="sm">Delete</DestructiveButton>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Information */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Color Mapping</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: colors.css.primary }}
                />
                <span className="font-medium">Primary:</span>
                <span className="text-muted-foreground">
                  {colors.theme === 'light' ? 'Navy' : 'Teal'} -{' '}
                  {colors.getNavyColor('hex')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: colors.css.secondary }}
                />
                <span className="font-medium">Secondary:</span>
                <span className="text-muted-foreground">
                  {colors.theme === 'light' ? 'Teal' : 'Dark Navy'} -{' '}
                  {colors.getTealColor('hex')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: colors.css.destructive }}
                />
                <span className="font-medium">Destructive:</span>
                <span className="text-muted-foreground">
                  Red - {colors.getRedColor('hex')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: colors.css.accent }}
                />
                <span className="font-medium">Accent:</span>
                <span className="text-muted-foreground">
                  {colors.theme === 'light' ? 'Mint' : 'Dark Navy'} -{' '}
                  {colors.getMintColor('hex')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Examples */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Usage Examples</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Import</h3>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                {`import { 
  PrimaryButton, 
  SecondaryButton, 
  DestructiveButton 
} from '@/components/ui/standardButtons';`}
              </pre>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Usage</h3>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                {`<PrimaryButton onClick={handleSave}>
  Save Workout
</PrimaryButton>

<DestructiveButton onClick={handleDelete}>
  Delete Exercise
</DestructiveButton>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
