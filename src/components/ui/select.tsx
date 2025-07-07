import * as React from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export function Select({
  value,
  onValueChange,
  placeholder,
  children,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const selectRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const contextValue = {
    value,
    onValueChange: (newValue: string) => {
      onValueChange?.(newValue);
      setIsOpen(false);
      setSearchTerm('');
    },
    isOpen,
    setIsOpen,
  };

  // Filter children based on search term
  const filteredChildren = React.Children.toArray(children).filter(child => {
    if (React.isValidElement<SelectItemProps>(child)) {
      const childText =
        typeof child.props.children === 'string'
          ? child.props.children
          : String(child.props.children);
      return childText.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // Find selected item display text
  const selectedChild = React.Children.toArray(children).find(
    child =>
      React.isValidElement<SelectItemProps>(child) &&
      child.props.value === value
  ) as React.ReactElement<SelectItemProps> | undefined;

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          className={cn(
            'flex h-12 lg:h-14 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm lg:text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            !value && 'text-muted-foreground'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">
            {value && selectedChild
              ? selectedChild.props.children
              : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-md border bg-popover shadow-md">
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-48 overflow-auto">
              {filteredChildren.length > 0 ? (
                filteredChildren
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No workouts found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectItem({ value, children, onSelect }: SelectItemProps) {
  const context = React.useContext(SelectContext);

  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        context.value === value && 'bg-accent text-accent-foreground'
      )}
      onClick={() => {
        context.onValueChange?.(value);
        onSelect?.(value);
      }}
    >
      {children}
    </div>
  );
}
