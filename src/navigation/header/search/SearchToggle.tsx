import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { SearchInput } from './SearchInput';
import { SearchPopover } from './SearchPopover';
import { useSearch } from './useSearch';

import './SearchToggle.scss';

interface SearchToggleProps {
  compact?: boolean;
}

export const SearchToggle = ({ compact }: SearchToggleProps) => {
  const {
    query,
    setQuery,
    result,
    usersResult,
    show,
    setShow,
    activeTab,
    setActiveTab,
    isStaffOrSupportUser,
  } = useSearch();

  // Keyboard shortcuts: Cmd/Ctrl+K to open, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShow(true);
      }
      // Escape to close search
      if (e.key === 'Escape' && show) {
        e.preventDefault();
        setShow(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, setShow]);

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom-start"
      show={show}
      overlay={
        <Popover id="GlobalSearch">
          <SearchPopover
            result={result}
            usersResult={usersResult}
            query={query}
            show={show}
            setQuery={setQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isStaffOrSupportUser={isStaffOrSupportUser}
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
              showShortcut={!show}
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
