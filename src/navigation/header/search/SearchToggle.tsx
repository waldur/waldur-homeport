import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import * as RadixPopover from '@radix-ui/react-popover';
import { useEffect } from 'react';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

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
    <RadixPopover.Root open={show} onOpenChange={setShow} modal={false}>
      {/*
        Anchor, not Trigger: opening isn't one clickable element here — it's
        the compact button, the mobile button, or focusing the inline
        desktop SearchInput, each already calling setShow(true) directly.
        Anchor only gives Content something to position against.
      */}
      <RadixPopover.Anchor asChild>
        <div className="d-flex align-items-center" id="searchContainer">
          {compact ? (
            <Tip
              label={translate('Search')}
              id="search-toggle-tip"
              placement="bottom"
            >
              <button
                className="btn-nav-item"
                type="button"
                onClick={() => setShow(true)}
                aria-label={translate('Search')}
              >
                <span className="svg-icon svg-icon-2">
                  <MagnifyingGlassIcon weight="bold" />
                </span>
              </button>
            </Tip>
          ) : (
            <>
              <SearchInput
                result={result}
                query={query}
                setQuery={setQuery}
                show={show}
                className="d-none d-lg-block"
                showShortcut={!show}
                onFocus={() => setShow(true)}
              />
              <Tip
                label={translate('Search')}
                id="search-toggle-mobile-tip"
                placement="bottom"
              >
                <button
                  className="btn-nav-item d-lg-none"
                  type="button"
                  onClick={() => setShow(true)}
                  aria-label={translate('Search')}
                >
                  <span className="svg-icon svg-icon-2">
                    <MagnifyingGlassIcon weight="bold" />
                  </span>
                </button>
              </Tip>
            </>
          )}
        </div>
      </RadixPopover.Anchor>
      <RadixPopover.Portal>
        <RadixPopover.Content
          id="GlobalSearch"
          side="bottom"
          align="start"
          sideOffset={2}
          // position-static: Bootstrap's own .popover class hardcodes
          // `position: absolute; left: 0`, fighting the Radix popper
          // wrapper for control of this box's placement — see
          // TableColumnsButton.tsx's own comment on this exact fix. Also
          // the direct cause of "search panel too narrow": with the panel
          // taken out of the wrapper's flow, Radix never got a real width
          // to measure, so #GlobalSearch's own width/max-width rules
          // (SearchToggle.scss) had nothing correctly-flowing to apply to.
          className="popover position-static"
        >
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
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};
