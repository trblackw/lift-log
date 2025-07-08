import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  searchable?: boolean;
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
  searchable = true,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dropdownPosition, setDropdownPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });
  const selectRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Update dropdown position when opened
  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4, // 4px gap
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Check if click is outside the select button
      if (selectRef.current && !selectRef.current.contains(target)) {
        // Check if click is outside the dropdown (which is portaled)
        const dropdownElement = document.querySelector(
          '[data-select-dropdown]'
        );
        if (!dropdownElement || !dropdownElement.contains(target)) {
          setIsOpen(false);
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const contextValue = {
    value,
    onValueChange: (newValue: string) => {
      onValueChange?.(newValue);
      setIsOpen(false);
      if (searchable) {
        setSearchTerm('');
      }
    },
    isOpen,
    setIsOpen,
  };

  // Filter children based on search term (only if searchable)
  const filteredChildren = searchable
    ? React.Children.toArray(children).filter(child => {
        if (React.isValidElement<SelectItemProps>(child)) {
          const childText =
            typeof child.props.children === 'string'
              ? child.props.children
              : String(child.props.children);
          return childText.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
      })
    : React.Children.toArray(children);

  // Find selected item display text
  const selectedChild = React.Children.toArray(children).find(
    child =>
      React.isValidElement<SelectItemProps>(child) &&
      child.props.value === value
  ) as React.ReactElement<SelectItemProps> | undefined;

  const dropdown = isOpen ? (
    <SelectContext.Provider value={contextValue}>
      <div
        data-select-dropdown
        className="fixed z-[9999] max-h-60 overflow-hidden rounded-md border bg-popover shadow-md"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
        }}
      >
        {searchable && (
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        <div
          className={
            searchable ? 'max-h-48 overflow-auto' : 'max-h-60 overflow-auto'
          }
        >
          {filteredChildren.length > 0 ? (
            filteredChildren
          ) : searchable ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No items found.
            </div>
          ) : null}
        </div>
      </div>
    </SelectContext.Provider>
  ) : null;

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative" ref={selectRef}>
        <button
          ref={buttonRef}
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

        {isOpen &&
          typeof document !== 'undefined' &&
          createPortal(dropdown, document.body)}
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
