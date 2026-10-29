import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import {
  forwardRef,
  KeyboardEvent,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';

import { BaseButton, LoadingSpinner } from 'waldur-ui';

import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';

import { SearchResult } from './useSearch';
import { getShortcutHint } from './utils';

export interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  result?: SearchResult;
  isLoading?: boolean;
  show?: boolean;
  className?: string;
  showShortcut?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  /**
   * Fired when the user acts on the field: click, typing, Enter or ArrowDown.
   * Deliberately not on bare focus, so a keyboard user can Tab past the field
   * without being pulled into the panel.
   */
  onOpen?: () => void;
  onClear?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      query,
      setQuery,
      result,
      isLoading,
      show,
      className,
      showShortcut,
      placeholder = translate('Search...'),
      autoFocus,
      onOpen,
      onClear,
      onKeyDown,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const isBusy =
      isLoading ??
      ((show ?? true) && Boolean(result?.isLoading || result?.isRefetching));

    const shortcutHint = useMemo(() => getShortcutHint(), []);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (onOpen && (event.key === 'Enter' || event.key === 'ArrowDown')) {
        event.preventDefault();
        onOpen();
      }
    };

    const handleClear = () => {
      setQuery('');
      onClear?.();
      inputRef.current?.focus();
    };

    const renderEndAdornment = () => {
      if (isBusy) {
        return (
          <span className="leading-none text-quinary" aria-live="polite">
            <LoadingSpinner size={15} className="align-middle" />
          </span>
        );
      }

      if (query) {
        return (
          <BaseButton
            size="sm"
            variant="text-secondary"
            className="pointer-events-auto"
            onClick={handleClear}
            iconNode={<XIcon weight="bold" />}
            tooltip={translate('Clear')}
          />
        );
      }

      if (showShortcut) {
        return (
          <kbd
            aria-hidden="true"
            className="text-secondary text-xs bg-quaternary px-[0.5rem] py-[0.25rem] rounded-lg select-none font-sans leading-none"
          >
            {shortcutHint}
          </kbd>
        );
      }

      return null;
    };

    return (
      <div className={className}>
        {/* A lone text field submits its form on Enter, which would reload the page. */}
        <form
          role="search"
          className="w-full relative"
          autoComplete="off"
          onSubmit={(event) => event.preventDefault()}
        >
          <BaseInputField
            ref={inputRef}
            type="text"
            start={<MagnifyingGlassIcon size={20} weight="bold" />}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              onOpen?.();
            }}
            onClick={onOpen}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
            aria-keyshortcuts="Control+k Meta+k"
            aria-busy={isBusy}
            autoFocus={autoFocus}
            end={renderEndAdornment()}
          />
        </form>
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
