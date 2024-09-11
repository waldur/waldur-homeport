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
        <SearchInput
          result={result}
          query={query}
          setQuery={setQuery}
          show={show}
          className="d-none d-lg-block"
        />
        <div className="btn btn-icon btn-icon-grey-500 btn-active-secondary w-35px h-35px w-md-40px h-md-40px d-lg-none">
          <span className="svg-icon">
            <MagnifyingGlass className="w-20px h-20px" weight="bold" />
          </span>
        </div>
      </div>
    </OverlayTrigger>
  );
};
