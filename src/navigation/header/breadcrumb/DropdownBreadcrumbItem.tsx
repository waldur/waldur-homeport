import { CaretDownIcon } from '@phosphor-icons/react';
import * as RadixPopover from '@radix-ui/react-popover';
import { useState } from 'react';

import { MiddleTruncate } from '@/core/MiddleTruncate';
import { IBreadcrumbItem } from '@/navigation/types';

import { BreadcrumbItem } from './BreadcrumbItem';

export const DropdownBreadcrumbItem = ({ item }: { item: IBreadcrumbItem }) => {
  const [show, setShow] = useState(false);

  return (
    <RadixPopover.Root open={show} onOpenChange={setShow} modal={false}>
      <RadixPopover.Trigger asChild>
        <BreadcrumbItem
          key={item.key}
          to={item.to}
          params={item.params}
          ellipsis={item.ellipsis}
          active={item.active}
          className="cursor-pointer"
        >
          {item.active ? (
            // The last/active breadcrumb (e.g. resource name) stays on one line
            // and middle-truncates ("start…end") only when it doesn't fit, so the
            // header actions stay on screen and the suffix stays readable.
            <MiddleTruncate text={item.text} />
          ) : item.truncate && item.text.length > 4 ? (
            <span className="breadcrumb-text" title={item.text}>
              {item.text}
            </span>
          ) : (
            item.text
          )}
          {!item.hideDropdownArrow && (
            <span className="svg-icon svg-icon-4 svg-icon-gray-600 icon-align ms-8px">
              <CaretDownIcon weight="bold" />
            </span>
          )}
        </BreadcrumbItem>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side="bottom"
          align="start"
          sideOffset={2}
          // position-static: Bootstrap's own .popover class hardcodes
          // `position: absolute; left: 0`, fighting the Radix popper
          // wrapper for control of this box's placement — see
          // TableColumnsButton.tsx's own comment on this exact fix.
          className="popover mw-400px min-w-200px pb-2 position-static"
        >
          {typeof item.dropdown === 'function'
            ? item.dropdown(() => setShow(false))
            : item.dropdown}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};
