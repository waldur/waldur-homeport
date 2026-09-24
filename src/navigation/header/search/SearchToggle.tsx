import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import * as RadixPopover from '@radix-ui/react-popover';
import { KeyboardEvent as ReactKeyboardEvent, useEffect, useRef } from 'react';

import { Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';

import { SearchInput } from './SearchInput';
import { SearchPopover } from './SearchPopover';
import { getTabbableAfter, getTabbables } from './tabbables';
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

  const anchorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // A pointer press outside the panel already decided where focus goes, so
  // the close handler must leave it alone.
  const pointerDownOutsideRef = useRef(false);

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

  // What the user acted on to open the panel: the header field on desktop,
  // the search button in compact and mobile layouts.
  const getOpener = () => {
    const tabbables = anchorRef.current ? getTabbables(anchorRef.current) : [];
    return tabbables[tabbables.length - 1] ?? null;
  };

  const handleOpenAutoFocus = (event: Event) => {
    // Radix would focus the panel's field and select its whole value; the
    // value mirrors what was just typed in the header field, so the next
    // keystroke would replace it. Put the caret after the text instead.
    event.preventDefault();
    const input = contentRef.current?.querySelector('input');
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  };

  const handleCloseAutoFocus = (event: Event) => {
    // Radix only hands focus back to a Trigger and there is none here (see
    // the Anchor comment below), so without this Escape drops focus to body.
    event.preventDefault();
    const pointerDownOutside = pointerDownOutsideRef.current;
    pointerDownOutsideRef.current = false;
    if (pointerDownOutside || document.activeElement !== document.body) return;
    getOpener()?.focus();
  };

  const handleContentKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const tabbables = getTabbables(event.currentTarget);
    const edge = event.shiftKey
      ? tabbables[0]
      : tabbables[tabbables.length - 1];
    if (!edge || document.activeElement !== edge) return;
    // The panel is portaled to the end of <body>, and Radix loops Tab back to
    // its first control. Hand focus over as if the panel sat right after the
    // header field in the document: back to the opener, or on to whatever
    // follows the search in the header.
    event.preventDefault();
    const target = event.shiftKey
      ? getOpener()
      : anchorRef.current &&
        getTabbableAfter(anchorRef.current, event.currentTarget);
    setShow(false);
    target?.focus();
  };

  return (
    <RadixPopover.Root open={show} onOpenChange={setShow} modal={false}>
      {/*
        Anchor, not Trigger: opening isn't one clickable element here — it's
        the compact button, the mobile button, or acting on the inline
        desktop SearchInput, each already calling setShow(true) directly.
        Anchor only gives Content something to position against.
      */}
      <RadixPopover.Anchor asChild>
        <div
          className="d-flex align-items-center"
          id="searchContainer"
          ref={anchorRef}
        >
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
                onOpen={() => setShow(true)}
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
          ref={contentRef}
          id="GlobalSearch"
          side="bottom"
          align="start"
          sideOffset={2}
          className="z-header-popover rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] shadow-[var(--dropdown-shadow)] text-[var(--surface-text-primary)] outline-hidden"
          onOpenAutoFocus={handleOpenAutoFocus}
          onCloseAutoFocus={handleCloseAutoFocus}
          onPointerDownOutside={() => {
            pointerDownOutsideRef.current = true;
          }}
          onKeyDown={handleContentKeyDown}
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
