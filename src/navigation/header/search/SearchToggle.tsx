import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import * as RadixPopover from '@radix-ui/react-popover';
import { useEffect } from 'react';

import { Tooltip } from 'waldur-ui';

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
            <Tooltip label={translate('Search')} side="bottom">
              <button
                type="button"
                onClick={() => setShow(true)}
                aria-label={translate('Search')}
                className="btn-nav-item"
              >
                <span className="svg-icon svg-icon-2">
                  <MagnifyingGlassIcon weight="bold" />
                </span>
              </button>
            </Tooltip>
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
              <Tooltip label={translate('Search')} side="bottom">
                <button
                  type="button"
                  onClick={() => setShow(true)}
                  aria-label={translate('Search')}
                  className="btn-nav-item d-lg-none"
                >
                  <span className="svg-icon svg-icon-2">
                    <MagnifyingGlassIcon weight="bold" />
                  </span>
                </button>
              </Tooltip>
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
          className="z-50 rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] shadow-[var(--dropdown-shadow)] text-[var(--surface-text-primary)] outline-hidden"
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
