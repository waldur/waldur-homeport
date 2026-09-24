import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { KeyboardEvent, useMemo } from 'react';

import { BaseStringField } from '@/form';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

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
        className="w-100 position-relative"
        autoComplete="off"
        onSubmit={(event) => event.preventDefault()}
      >
        <BaseStringField
          className="search-input w-lg-325px"
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
          <span className="position-absolute top-50 end-0 translate-middle-y me-4 z-index-5 text-gray-700 fs-8 bg-gray-200 px-2 py-1 rounded">
            {shortcutHint}
          </span>
        )}

        {/* Loading */}
        {show && isLoading ? (
          <span className="position-absolute top-50 end-0 translate-middle-y lh-0 me-4 z-index-5">
            <span className="spinner-border h-15px w-15px align-middle text-gray-400" />
          </span>
        ) : null}
        {/* Clear button */}
        {!isLoading && query ? (
          <CompactActionButton
            variant="text-secondary"
            className="position-absolute top-50 end-0 translate-middle-y me-4 z-index-5"
            action={() => setQuery('')}
            iconNode={<XIcon weight="bold" />}
            tooltip={translate('Clear')}
          />
        ) : null}
      </form>
    </div>
  );
};
