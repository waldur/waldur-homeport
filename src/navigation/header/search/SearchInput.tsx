import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { KeyboardEvent, useMemo } from 'react';

import { BaseButton } from 'waldur-ui';

import { BaseStringField } from '@/form';
import { translate } from '@/i18n';

import { SearchResult } from './useSearch';

interface SearchProps {
  result: SearchResult;
  query: string;
  show: boolean;
  setQuery;
  className?: string;
  showShortcut?: boolean;
  /**
   * Fired when the user acts on the field: click, typing, Enter or ArrowDown.
   * Deliberately not on bare focus, so a keyboard user can Tab past the field
   * without being pulled into the panel.
   */
  onOpen?: () => void;
}

const getShortcutHint = () => {
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  return isMac ? '⌘K' : 'Ctrl+K';
};

export const SearchInput = ({
  result,
  query,
  show,
  setQuery,
  className,
  showShortcut,
  onOpen,
}: SearchProps) => {
  const isLoading = result.isLoading || result.isRefetching;
  const shortcutHint = useMemo(() => getShortcutHint(), []);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (onOpen && (event.key === 'Enter' || event.key === 'ArrowDown')) {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <div className={className}>
      {/* A lone text field submits its form on Enter, which would reload the page. */}
      <form
        className="w-full relative"
        autoComplete="off"
        onSubmit={(event) => event.preventDefault()}
      >
        <BaseStringField
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onOpen?.();
          }}
          onClick={onOpen}
          onKeyDown={handleKeyDown}
          placeholder={translate('Search...')}
          icon={<MagnifyingGlassIcon weight="bold" />}
        />

        {/* Keyboard shortcut hint */}
        {showShortcut && !query && (
          <span className="absolute end-0 top-1/2 -translate-y-1/2 me-[0.924rem] z-[5] text-secondary text-xs bg-quaternary px-[0.5rem] py-[0.25rem] rounded-lg">
            {shortcutHint}
          </span>
        )}

        {/* Loading */}
        {show && isLoading ? (
          <span className="absolute end-0 top-1/2 -translate-y-1/2 leading-none me-[0.924rem] z-[5]">
            <span className="spinner-border size-[15px] align-middle text-quinary" />
          </span>
        ) : null}
        {/* Clear button */}
        {!isLoading && query ? (
          <BaseButton
            size="sm"
            variant="text-secondary"
            className="absolute end-0 top-1/2 -translate-y-1/2 me-[0.924rem] z-[5]"
            onClick={() => setQuery('')}
            iconNode={<XIcon weight="bold" />}
            tooltip={translate('Clear')}
          />
        ) : null}
      </form>
    </div>
  );
};
