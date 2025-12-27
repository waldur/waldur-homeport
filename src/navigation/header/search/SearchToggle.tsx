import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { SearchInput } from './SearchInput';
import { SearchPopover } from './SearchPopover';
import { useSearch } from './useSearch';

import './SearchToggle.scss';

interface SearchToggleProps {
  compact?: boolean;
}

export const SearchToggle = ({ compact }: SearchToggleProps) => {
  const { query, setQuery, result, show, setShow } = useSearch();

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom-start"
      show={show}
      overlay={
        <Popover id="GlobalSearch">
          <SearchPopover
            result={result}
            query={query}
            show={show}
            setQuery={setQuery}
            close={() => setShow(false)}
          />
        </Popover>
      }
      rootClose={true}
    >
      <div
        className="d-flex align-items-center"
        id="searchContainer"
        onClick={() => setShow(true)}
        aria-hidden="true"
      >
        {compact ? (
          <button className="btn-nav-item" type="button">
            <span className="svg-icon svg-icon-2">
              <MagnifyingGlassIcon weight="bold" />
            </span>
          </button>
        ) : (
          <>
            <SearchInput
              result={result}
              query={query}
              setQuery={setQuery}
              show={show}
              className="d-none d-lg-block"
            />
            <button className="btn-nav-item d-lg-none" type="button">
              <span className="svg-icon svg-icon-2">
                <MagnifyingGlassIcon weight="bold" />
              </span>
            </button>
          </>
        )}
      </div>
    </OverlayTrigger>
  );
};
