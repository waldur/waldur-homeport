import {
  ArrowsClockwiseIcon,
  CaretRightIcon,
  FunnelSimpleIcon,
  PlusIcon,
  StarIcon,
} from '@phosphor-icons/react';
import * as RadixPopover from '@radix-ui/react-popover';
import classNames from 'classnames';
import React, { FC, useCallback, useContext, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { selectSavedFilter, setSavedFilters } from './actions';
import { COLUMN_FILTER_TOGGLE_CLASS } from './constants';
import { TableFilterContext } from './FilterContextProvider';
import { SavedFilterSelect } from './SavedFilterSelect';
import {
  selectFilterValues,
  selectSelectedSavedFilter,
  selectTableSavedFilters,
} from './selectors';
import { TableFilterService } from './TableFilterService';
import { TableProps } from './types';
import { getSavedFiltersKey } from './utils';

const SaveFilterDialog = lazyComponent(() =>
  import('./SaveFilterDialog').then((module) => ({
    default: module.SaveFilterDialog,
  })),
);

// TableBody.tsx's hasFilterMenu() decides whether to show a cell's inline
// "filter by this value" shortcut by querying the DOM for
// `#kt_content_container .table-filters-menu #filter-item-{key}` — a
// selector that assumes this Content lives *inside* the page's content
// wrapper, matching Metronic's own pre-Radix markup (never portaled).
// Radix Popover.Portal defaults to document.body, which moves this
// Content — and every `#filter-item-*` row inside it — clean outside
// `#kt_content_container`, so that selector silently stopped matching
// and the inline shortcut stopped appearing at all (reported live:
// "inline & column table filters does not work anymore"). Anchoring the
// portal back inside the content wrapper restores the assumption without
// touching hasFilterMenu() itself. Falls back to Radix's own default
// (document.body) wherever the wrapper isn't present — Storybook/tests
// that don't render the real layout shell.
const getFilterMenuPortalContainer = () =>
  document.getElementById('kt_content_container') ?? undefined;

/**
 * A row that flies out a sub-panel to the right on click — the same shape
 * as core's own `.menu-sub` flyout, but on a Radix Popover (its own
 * independent open state) rather than DropdownMenu.Sub: the flyouts here
 * hold real form controls (SavedFilterSelect's WindowedSelect below, and
 * every individual filter's own input in TableFilterItem.tsx), and a
 * DropdownMenu's roving-tabindex/typeahead collection steals keystrokes
 * from a focused text input the moment one matches a sibling item's label
 * (confirmed empirically for ScriptEditorHeader.tsx's search box earlier
 * in this migration — see ActionsPopoverComponent's own comment in
 * ActionsDropdown.tsx). Popover has no such collection, so nesting one
 * inside another's Content is safe.
 */
const FlyoutRow: FC<
  React.PropsWithChildren<{
    label: string;
    icon: React.ReactNode;
    content: React.ReactNode;
    onOpenChange?(open: boolean): void;
  }>
> = ({ label, icon, content, onOpenChange }) => (
  <RadixPopover.Root modal={false} onOpenChange={onOpenChange}>
    <RadixPopover.Trigger asChild>
      <span className="menu-link" role="button">
        <span className="menu-title">{label}</span>
        {icon}
      </span>
    </RadixPopover.Trigger>
    <RadixPopover.Portal>
      <RadixPopover.Content
        side="right"
        align="start"
        sideOffset={2}
        data-popper-placement="right-start"
        className="menu-sub menu-sub-dropdown show w-250px py-3 shadow-sm"
      >
        {content}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  </RadixPopover.Root>
);

const SaveFilterItems = ({ table, formId, apply }) => {
  const dispatch = useDispatch();
  const { openDialog } = useModal();
  const formValues = useSelector(selectFilterValues(table)) || {};

  const selectedSavedFilter = useSelector((state: any) =>
    selectSelectedSavedFilter(state, table),
  );
  const key = useMemo(() => getSavedFiltersKey(table, formId), [table, formId]);

  const list = useSelector((state: any) =>
    selectTableSavedFilters(state, table),
  );

  const saveFilter = useCallback(
    (name, update: boolean) => {
      let newItem;
      const valuesCopy = { ...formValues };
      Object.entries(valuesCopy).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length === 0) {
          delete valuesCopy[key];
        }
      });
      if (update && selectedSavedFilter) {
        // Update
        newItem = {
          ...selectedSavedFilter,
          title: name,
          date: new Date().toISOString(),
          values: valuesCopy,
        };
      } else {
        // New
        const isoDate = new Date().toISOString();
        newItem = {
          id: `${table}-${formId}-${isoDate}`,
          title: name || formatDateTime(null),
          date: isoDate,
          values: valuesCopy,
        };
      }

      TableFilterService.addOrReplace(key, newItem);
      dispatch(setSavedFilters(table, TableFilterService.list(key).reverse()));
      dispatch(selectSavedFilter(table, newItem));
    },
    [key, formValues, selectedSavedFilter, table, formId, dispatch],
  );

  const onSaveFilter = (e, update = false) => {
    openDialog(SaveFilterDialog, {
      resolve: {
        saveFilter,
      },
      size: 'sm',
      initialValues:
        update && selectedSavedFilter
          ? { name: selectedSavedFilter.title }
          : undefined,
    });
    e.stopPropagation();
  };

  const hasFiltersApplied = Object.values(formValues || {}).filter(
    (f) => Boolean(f) || f === false,
  ).length;

  return (
    <>
      {(hasFiltersApplied || selectedSavedFilter) && (
        <div className="menu-item">
          <FlyoutRow
            label={translate('Current filters')}
            icon={
              <CaretRightIcon size={20} className="ms-auto" weight="bold" />
            }
            content={
              <>
                <span
                  className="menu-link"
                  aria-hidden="true"
                  onClick={onSaveFilter}
                >
                  <span className="menu-title">{translate('Save as')}</span>
                  <StarIcon size={20} className="ms-auto" weight="bold" />
                </span>
                {selectedSavedFilter ? (
                  <span
                    className="menu-link"
                    aria-hidden="true"
                    onClick={(e) => onSaveFilter(e, true)}
                  >
                    {translate('Update')}
                    <ArrowsClockwiseIcon
                      size={20}
                      className="ms-auto"
                      weight="bold"
                    />
                  </span>
                ) : null}
              </>
            }
          />
        </div>
      )}
      <div className="menu-item">
        <FlyoutRow
          label={translate('Saved filters ({count})', { count: list.length })}
          icon={<CaretRightIcon size={20} className="ms-auto" weight="bold" />}
          content={
            <div className="menu-item">
              <div
                className="menu-content filter-field"
                onClick={(e) => e.stopPropagation()}
                aria-hidden="true"
              >
                <SavedFilterSelect
                  table={table}
                  formId={formId}
                  filterPosition="menu"
                  onSelect={apply}
                />
              </div>
            </div>
          }
        />
      </div>
    </>
  );
};

interface TableFiltersMenuProps extends Pick<
  TableProps,
  | 'filters'
  | 'formId'
  | 'filterPosition'
  | 'filtersStorage'
  | 'setFilter'
  | 'applyFiltersFn'
> {
  table?: TableProps['table'];
  selectedSavedFilter?: TableProps['selectedSavedFilter'];
  openName?: string;
  toggleFilterMenu?(show?): void;
}

export const TableFiltersMenu: FC<TableFiltersMenuProps> = (props) => {
  const context = useContext(TableFilterContext);
  const [open, setOpen] = useState(false);

  const apply = useCallback(
    (hideMenu = true) => {
      props.applyFiltersFn(true);
      if (hideMenu) {
        setOpen(false);
      }
      if (props.toggleFilterMenu) props.toggleFilterMenu(true);
    },
    [props.applyFiltersFn, props.toggleFilterMenu],
  );

  // The column-filter toggle only makes sense if a filter with this exact
  // name is actually among `props.filters` — otherwise it opened an empty
  // menu for a column whose filter was removed/renamed. The previous
  // Metronic version checked this by querying the *always-mounted*
  // (CSS-hidden) content div, which Radix's conditional mounting doesn't
  // allow before the first open; checking the filters themselves instead
  // works whether or not the menu has ever opened.
  const existed =
    !props.openName ||
    React.Children.toArray(props.filters).some(
      (child: any) => child?.props?.name === props.openName,
    );
  if (!existed) return null;

  return (
    <TableFilterContext.Provider
      value={{
        ...context,
        apply,
        openMenuName: props.openName,
        menuIsOpen: open,
        // TableFilterItem.tsx positions its own flyout `bottom` (under the
        // trigger) when opened from a column header versus `right` (beside
        // the row) from the "Add filter" list — but this flag has been
        // declared and read since it was introduced (Nov 2024,
        // [WAL-7415]) without ever actually being set anywhere, so every
        // filter flyout has always positioned as if opened from the "Add
        // filter" list regardless of which trigger opened it. `openName`
        // is only ever set on the column-header instance (TableHeader.tsx),
        // so its presence is exactly the signal TableFilterItem needs.
        columnFilter: Boolean(props.openName),
      }}
    >
      <RadixPopover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) props.applyFiltersFn(false);
        }}
        modal={false}
      >
        {props.openName ? (
          <>
            <RadixPopover.Trigger asChild>
              <button
                type="button"
                aria-label={translate('Filter by column')}
                className={classNames(COLUMN_FILTER_TOGGLE_CLASS, 'text-btn')}
              >
                <FunnelSimpleIcon size={16} weight="bold" />
              </button>
            </RadixPopover.Trigger>
            <RadixPopover.Portal
              forceMount
              container={getFilterMenuPortalContainer()}
            >
              {/* forceMount + a conditional `show` class, rather than
                  letting Radix unmount this while closed (its default):
                  TableBody.tsx's hasFilterMenu() decides whether to show
                  a cell's inline-filter shortcut by directly querying the
                  DOM for `#filter-item-{name}` inside `.table-filters-menu`
                  — a check that assumed Metronic's own always-mounted,
                  CSS-hidden markup, and would wrongly find nothing (hiding
                  the shortcut) whenever this menu just happens to be
                  closed, which is most of the time. */}
              <RadixPopover.Content
                forceMount
                side="bottom"
                align="start"
                sideOffset={2}
                data-popper-placement="bottom"
                className={classNames(
                  'table-filters-menu column-filter menu menu-sub menu-sub-dropdown menu-column menu-gray-600 menu-state-bg-gray fw-bold fs-6',
                  open && 'show',
                )}
              >
                {props.filters}
              </RadixPopover.Content>
            </RadixPopover.Portal>
          </>
        ) : (
          <>
            {/* Tip wraps the Trigger, not the other way around: Tip
                (src/core/Tooltip.tsx) is a plain function component, not
                forwardRef, so nesting it *inside* `Trigger asChild` broke
                the trigger outright — Radix's Slot had nothing but Tip
                itself to attach its ref/merged props to, and Tip doesn't
                forward either to the real <Button> further in. Reported
                live: the button rendered but didn't open anything.
                TableDropdownToggle's own disabled-tooltip case
                (ActionsDropdown.tsx) uses this same wrap-the-trigger,
                not wrap-inside-it, shape for the same reason. */}
            <Tip id="table-add-filter-tip" label={translate('Add filter')}>
              <RadixPopover.Trigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label={translate('Add filter')}
                  className="btn-icon btn-add-filter"
                >
                  <span className="svg-icon svg-icon-4">
                    <PlusIcon weight="bold" />
                  </span>
                </Button>
              </RadixPopover.Trigger>
            </Tip>
            {/* forceMount + conditional `show` — same reasoning as the
                column-filter toggle's Content above. */}
            <RadixPopover.Portal
              forceMount
              container={getFilterMenuPortalContainer()}
            >
              <RadixPopover.Content
                forceMount
                side="bottom"
                align="start"
                sideOffset={2}
                data-popper-placement="bottom-start"
                className={classNames(
                  'table-filters-menu menu menu-sub menu-sub-dropdown menu-column menu-gray-700 menu-state-bg-gray fw-bold py-1 fs-6 w-250px',
                  open && 'show',
                )}
              >
                <SaveFilterItems
                  table={props.table}
                  formId={context.form}
                  apply={() => props.applyFiltersFn(true)}
                />

                <div className="separator" />
                {props.filters}
              </RadixPopover.Content>
            </RadixPopover.Portal>
          </>
        )}
      </RadixPopover.Root>
    </TableFilterContext.Provider>
  );
};

export { FlyoutRow };
