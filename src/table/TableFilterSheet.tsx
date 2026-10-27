import { XIcon } from '@phosphor-icons/react';
import { FC, useRef } from 'react';

import { translate } from 'waldur-i18n-runtime';
import {
  BaseButton,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from 'waldur-ui';

import { TableFilterActions } from './TableFilterActions';
import { TableFilterContainer } from './TableFilterContainer';
import { FilterItem } from './types';

interface TableFilterSheetProps {
  /** What the table's filter button opened, or null while the panel is shut. */
  panel: { filters: JSX.Element; formId?: string } | null;
  /** Closes the panel and keeps the filters as they were when it opened:
   * Cancel, the close button, Escape or a click outside. */
  onCancel(): void;
  /** Closes the panel keeping the filters set in it. */
  onApply(): void;
  table: string;
  setFilter: (item: FilterItem) => void;
}

/**
 * The table's filter panel at `filterPosition: "sidebar"` (narrow viewports):
 * a sheet the table owns, so it needs no app-wide drawer. Opened over a
 * drawer, it stacks on top and closing it returns to the drawer.
 */
export const TableFilterSheet: FC<TableFilterSheetProps> = ({
  panel,
  onCancel,
  onApply,
  table,
  setFilter,
}) => {
  // Opened without a SheetTrigger, so Radix has nothing to return focus to
  // on close: keep what had it (the Filters button) and focus it again.
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <Sheet
      open={Boolean(panel)}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-none lg:w-[500px] gap-0 bg-primary border-secondary"
        // Focus the panel, not its first button: the close button would show
        // its tooltip, and the first Escape would only hide that.
        onOpenAutoFocus={(event) => {
          returnFocus.current = document.activeElement as HTMLElement | null;
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          // A click outside that focused something else keeps that focus.
          const active = document.activeElement;
          if (!active || active === document.body || !active.isConnected) {
            returnFocus.current?.focus();
          }
        }}
      >
        <div className="flex items-center justify-between gap-1.5 min-h-[70px] mx-5 py-1.5 border-b-[1px] border-b-secondary">
          <div>
            <SheetTitle className="text-lg">{translate('Filters')}</SheetTitle>
            <SheetDescription className="font-medium text-quaternary">
              {translate('Apply filters to table data')}
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <BaseButton
              iconNode={<XIcon weight="bold" />}
              tooltip={translate('Close')}
              tooltipSide="bottom"
              size="sm"
              variant="tertiary"
            />
          </SheetClose>
        </div>
        {panel && (
          <TableFilterContainer
            table={table}
            filters={panel.filters}
            formId={panel.formId}
            setFilter={setFilter}
            footer={
              <TableFilterActions
                filters={panel.filters}
                table={table}
                apply={onApply}
                close={onCancel}
              />
            }
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
