import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useMemo } from 'react';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

import { SearchResult } from './useSearch';

interface SearchProps {
  result: SearchResult;
  query: string;
  show: boolean;
  setQuery;
  className?: string;
  autoFocus?: boolean;
  showShortcut?: boolean;
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
  autoFocus,
  showShortcut,
}: SearchProps) => {
  const isLoading = result.isLoading || result.isRefetching;
  const shortcutHint = useMemo(() => getShortcutHint(), []);

  return (
    <div className={className}>
      <form className="w-100 position-relative" autoComplete="off">
        <StringField
          className="search-input w-lg-325px"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={translate('Search...')}
          icon={<MagnifyingGlassIcon weight="bold" />}
          autoFocus={autoFocus}
        />

        {/* Keyboard shortcut hint */}
        {showShortcut && !query && (
          <span className="position-absolute top-50 end-0 translate-middle-y me-4 z-index-5 text-muted fs-8 bg-gray-200 px-2 py-1 rounded">
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
        <button
          type="button"
          className={classNames(
            'btn btn-flush btn-active-color-primary position-absolute top-50 end-0 translate-middle-y lh-0 me-4 z-index-5',
            !isLoading && query ? '' : 'd-none',
          )}
          onClick={() => setQuery('')}
        >
          <XIcon weight="bold" size={16} className="text-gray-400" />
        </button>
      </form>
    </div>
  );
};
