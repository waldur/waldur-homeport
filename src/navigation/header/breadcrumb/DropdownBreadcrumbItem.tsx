import { CaretDownIcon } from '@phosphor-icons/react';
import * as RadixPopover from '@radix-ui/react-popover';
import { KeyboardEvent, useRef, useState } from 'react';

import { MiddleTruncate } from '@/core/MiddleTruncate';
import { IBreadcrumbItem } from '@/navigation/types';

import { BreadcrumbItem } from './BreadcrumbItem';

export const DropdownBreadcrumbItem = ({ item }: { item: IBreadcrumbItem }) => {
  const [show, setShow] = useState(false);
  const crumbRef = useRef<HTMLElement>(null);
  const interactedOutside = useRef(false);

  // Only a crumb with a real link activates on Enter by itself; the active crumb
  // and the collapsed "..." one have no href, so both keys are handled here.
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === ' ' || (!item.to && event.key === 'Enter')) {
      event.preventDefault();
      setShow((value) => !value);
    }
  };

  const arrow = !item.hideDropdownArrow && (
    <span className="svg-icon svg-icon-4 svg-icon-gray-600 icon-align ms-8px">
      <CaretDownIcon weight="bold" />
    </span>
  );

  const crumb = (
    <BreadcrumbItem
      key={item.key}
      ref={crumbRef}
      to={item.to}
      params={item.params}
      ellipsis={item.ellipsis}
      active={item.active}
      className="cursor-pointer"
      onKeyDown={onKeyDown}
    >
      {item.active ? (
        // Nothing in the active crumb is focusable (react-bootstrap renders it
        // bare), so the label becomes the trigger: the <li> would drag the
        // separator slash into the focus ring, and Radix hands focus back to
        // the trigger on close, which an <li> cannot take.
        <RadixPopover.Trigger asChild>
          <span
            role="button"
            tabIndex={0}
            className="flex min-w-0 items-center"
          >
            {/* Stays on one line and middle-truncates ("start…end") only when
                it doesn't fit, so the header actions stay on screen. */}
            <MiddleTruncate text={item.text} />
            {arrow}
          </span>
        </RadixPopover.Trigger>
      ) : (
        <>
          {item.truncate && item.text.length > 4 ? (
            <span className="breadcrumb-text" title={item.text}>
              {item.text}
            </span>
          ) : (
            item.text
          )}
          {arrow}
        </>
      )}
    </BreadcrumbItem>
  );

  // The panel is portaled to the end of <body>, so Tab off either end of it
  // would land far from the crumb -- in the browser chrome, or at the top of the
  // page. Close it there instead; returnFocus then puts focus back on the crumb.
  // Shift+Tab from the panel itself counts as leaving: the "..." panel opens
  // with focus on its container rather than on a link.
  const leaveOnTab = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((node) => node.offsetParent !== null);
    const edge = event.shiftKey
      ? focusable[0]
      : focusable[focusable.length - 1];
    const leaving =
      !edge ||
      document.activeElement === edge ||
      (event.shiftKey && document.activeElement === event.currentTarget);
    if (!leaving) return;
    event.preventDefault();
    setShow(false);
  };

  // Radix focuses the trigger on close, but for every crumb except the active
  // one the trigger is the <li>, which cannot take focus, so it fell to <body>.
  // Focus the crumb's own control instead -- unless the panel closed because
  // the user clicked or tabbed elsewhere, where Radix leaves focus alone too.
  const returnFocus = (event: Event) => {
    event.preventDefault();
    if (!interactedOutside.current) {
      crumbRef.current
        ?.querySelector<HTMLElement>('a[href], [tabindex="0"]')
        ?.focus();
    }
    interactedOutside.current = false;
  };

  return (
    // Non-modal, so the page stays clickable while a switcher is open: a modal
    // one turned the first click on a sidebar link into a mere close.
    <RadixPopover.Root open={show} onOpenChange={setShow} modal={false}>
      {item.active ? (
        crumb
      ) : (
        <RadixPopover.Trigger asChild>{crumb}</RadixPopover.Trigger>
      )}
      <RadixPopover.Portal>
        <RadixPopover.Content
          onKeyDown={leaveOnTab}
          onInteractOutside={() => {
            interactedOutside.current = true;
          }}
          onCloseAutoFocus={returnFocus}
          side="bottom"
          align="start"
          sideOffset={2}
          className="z-header-popover mw-400px min-w-200px pb-2 rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] shadow-[var(--dropdown-shadow)] text-[var(--surface-text-primary)] outline-hidden"
        >
          {typeof item.dropdown === 'function'
            ? item.dropdown(() => setShow(false))
            : item.dropdown}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};
