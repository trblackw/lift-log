import { OutlineButton } from '@/components/ui/standardButtons';
import IconSquare from './icons/icon-square';
import IconListMinimal from './icons/icon-list-minimal';

export type ViewMode = 'list' | 'card';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <OutlineButton
        size="sm"
        onClick={() => onViewChange('card')}
        className={`px-3 py-1 text-xs transition-all ${
          currentView === 'card'
            ? 'bg-background shadow-sm border-border'
            : 'bg-transparent border-transparent hover:bg-background/50'
        }`}
      >
        <IconSquare className="size-4" />
      </OutlineButton>
      <OutlineButton
        size="sm"
        onClick={() => onViewChange('list')}
        className={`px-3 py-1 text-xs transition-all ${
          currentView === 'list'
            ? 'bg-background shadow-sm border-border'
            : 'bg-transparent border-transparent hover:bg-background/50'
        }`}
      >
        <IconListMinimal className="size-4" />
      </OutlineButton>
    </div>
  );
}
