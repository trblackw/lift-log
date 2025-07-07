import { OutlineButton } from '@/components/ui/standardButtons';
import IconSquare from './icons/icon-square';
import IconListMinimal from './icons/icon-list-minimal';
import { useCallback } from 'react';

export type ViewMode = 'list' | 'card';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  const getClassName = useCallback(
    (view: ViewMode) => {
      return `px-2 py-1 text-xs transition-all ${
        currentView === view
          ? 'bg-background shadow-sm border-border'
          : 'bg-transparent border-transparent hover:bg-background/50'
      }`;
    },
    [currentView]
  );

  return (
    <div className="flex items-center bg-muted rounded-lg">
      <OutlineButton
        size="sm"
        onClick={() => onViewChange('card')}
        className={getClassName('card')}
      >
        <IconSquare className="size-5" />
      </OutlineButton>
      <OutlineButton
        size="sm"
        onClick={() => onViewChange('list')}
        className={getClassName('list')}
      >
        <IconListMinimal className="size-5" />
      </OutlineButton>
    </div>
  );
}
