import classNames from 'classnames';
import { Fragment, ReactNode, useState } from 'react';

import { Popover, PopoverAnchor, PopoverContent } from 'waldur-ui';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { SdkFunction } from '@/table/api';

import { BaseAsyncListProps, RowData } from './types';
import {
  ComboboxLinkItem,
  ComboboxRow,
  useAsyncCombobox,
} from './useAsyncCombobox';

export interface AsyncSearchBoxItemProps<Item extends ComboboxLinkItem> {
  item: ComboboxRow<Item>;
  /** Whether the row is the combobox's highlighted option. */
  highlighted: boolean;
  /** Downshift's getItemProps, for the row's link: the option. */
  itemProps: Record<string, any>;
  /** Closes the results, for a control beside the option. */
  close: () => void;
}

interface AsyncSearchBoxProps<
  Fetcher extends SdkFunction,
  Item extends ComboboxLinkItem,
> extends BaseAsyncListProps<Fetcher> {
  /** What a row of the results links to and shows. */
  getItem: (row: RowData<Fetcher>) => Item;
  /** The option's text, for downshift. */
  itemToString: (item: Item) => string;
  /**
   * Draws a row: a link carrying `itemProps` (the option, with `tabIndex={-1}`),
   * and beside it, if anything, controls for the pointer only.
   */
  renderItem: (props: AsyncSearchBoxItemProps<Item>) => ReactNode;
  /** For the search box. */
  className?: string;
  wrapperClassName?: string;
}

/**
 * A search box whose results drop down below it: a downshift combobox
 * (useAsyncCombobox). Focus stays in the box while ArrowUp/ArrowDown move a
 * highlight through the results and Enter opens one; Escape, Tab and a click
 * elsewhere close them.
 *
 * Downshift alone decides when the results show; the Radix Popover only
 * places them, portaled so the hero's overflow can't clip them. Given no
 * onOpenChange, Radix can't dismiss them on its own -- it took focus in the
 * box, which sits in the Anchor, outside the panel, for leaving it.
 */
export const AsyncSearchBox = <
  Fetcher extends SdkFunction,
  Item extends ComboboxLinkItem,
>({
  getItem,
  itemToString,
  renderItem,
  emptyMessage = translate('There are no results for this keyword.'),
  placeholder = translate('Search...'),
  className,
  wrapperClassName,
  ...listProps
}: AsyncSearchBoxProps<Fetcher, Item>): JSX.Element => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const {
    isOpen,
    context,
    rows,
    search,
    changeSearch,
    highlightedIndex,
    getInputProps,
    getMenuProps,
    getItemProps,
    menuRef,
    sentinelRef,
    status,
  } = useAsyncCombobox({
    ...listProps,
    getItem,
    itemToString,
    emptyMessage,
    isOpen: open,
    onIsOpenChange: setOpen,
    debounceMs: 500,
  });

  return (
    <div className={wrapperClassName}>
      <Popover open={isOpen} modal={false}>
        <PopoverAnchor asChild>
          <div>
            <FilterBox
              {...getInputProps({
                type: 'search',
                'aria-label': placeholder,
                placeholder,
                autoComplete: 'off',
                spellCheck: false,
                value: search,
                onChange: (event: any) => changeSearch(event.target.value),
                // The results show as the box takes focus, by Tab too.
                onFocus: () => setOpen(true),
                preventEnterSubmit: false,
                className,
              })}
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          // Focus stays in the search box; the results are pointed at.
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          align="start"
          sideOffset={2}
          // As wide as the box, but not narrower than a row needs.
          className="z-nav-menu flex flex-col bg-[var(--menu-bg)] w-(--radix-popover-trigger-width) min-w-[280px] animate-[waldur-menu-enter-up_0.3s_ease] data-[side=top]:animate-[waldur-menu-enter-down_0.3s_ease] motion-reduce:animate-none"
        >
          {/* What the list holds instead of rows sits beside it: a
              listbox takes only options. */}
          {context.status === 'pending' ? (
            <div
              role="progressbar"
              aria-label={translate('Loading')}
              className="py-1.5"
            >
              <p className="text-center text-primary mb-0">
                {translate('Loading')}
              </p>
            </div>
          ) : context.status === 'error' ? (
            <p className="text-center text-primary mb-0 py-1.5">
              {translate('Error')}
            </p>
          ) : rows.length === 0 ? (
            <p className="text-center text-primary mb-0 px-3 py-1.5">
              {emptyMessage}
            </p>
          ) : null}
          <div
            {...getMenuProps(
              {
                ref: menuRef,
                'aria-label': translate('Search results'),
                className: classNames(
                  'max-h-[min(300px,var(--radix-popover-content-available-height))] overflow-auto',
                  rows.length > 0 && 'py-1.5',
                ),
              },
              // The list mounts only while the results show.
              { suppressRefError: true },
            )}
          >
            {context.status === 'success' &&
              rows.map((item, index) => (
                <Fragment key={item.value}>
                  {renderItem({
                    item,
                    highlighted: highlightedIndex === index,
                    itemProps: getItemProps({ item, index }),
                    close,
                  })}
                </Fragment>
              ))}
            {context.status === 'success' && context.hasNextPage && (
              <div
                ref={sentinelRef}
                className="text-center py-1.5 text-quaternary text-xs"
              >
                {context.isFetchingNextPage
                  ? translate('Loading more...')
                  : null}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {/* Announces what the search found. */}
      <div role="status" className="sr-only">
        {isOpen ? status : ''}
      </div>
    </div>
  );
};
