import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

import { SearchResult } from './useSearch';

interface SearchProps {
  result: SearchResult;
  query: string;
  show: boolean;
  setQuery;
  className?: string;
}

export const SearchInput = ({
  result,
  query,
  show,
  setQuery,
  className,
}: SearchProps) => {
  const isLoading = result.isLoading || result.isRefetching;

  return (
    <div className={className}>
      <form className="w-100 position-relative" autoComplete="off">
        <StringField
          className="search-input w-lg-325px"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={translate('Search...')}
          icon={<MagnifyingGlassIcon weight="bold" />}
        />

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
