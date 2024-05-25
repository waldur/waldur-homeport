import { MagnifyingGlass } from '@phosphor-icons/react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { SearchInput } from './SearchInput';
import { SearchPopover } from './SearchPopover';
import { useSearch } from './useSearch';

import './SearchToggle.scss';

export const SearchToggle = () => {
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
          />
        </Popover>
      }
      rootClose={true}
    >
      <div
        className="d-flex align-items-center ms-1 ms-lg-3"
        id="searchContainer"
        onClick={() => setShow(true)}
        aria-hidden="true"
      >
        <SearchInput
          result={result}
          query={query}
          setQuery={setQuery}
          show={show}
          className="d-none d-lg-block"
        />
        <div className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px d-lg-none">
          <span className="svg-icon svg-icon-1">
            <MagnifyingGlass />
          </span>
        </div>
      </div>
    </OverlayTrigger>
  );
};
