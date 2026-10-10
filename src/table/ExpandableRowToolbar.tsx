import { FunnelSimpleIcon, GearSixIcon, XIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { ComponentType, FC, createElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  BaseButton,
  ButtonSize,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
  menuItem,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { resetSelection, setFilterQuery, toggleColumn } from '@/table/actions';
import { getTableState, selectSelectedRows } from '@/table/selectors';
import { TableQuery } from '@/table/TableQuery';

export interface ExpandableRowToolbarColumn {
  id: string;
  title: string;
  keys: string[];
}

interface ExpandableRowToolbarProps {
  /** Redux table key whose selection drives the bulk actions dropdown */
  activeTableKey: string | null;
  /** Component that renders the bulk actions dropdown body for the active tab */
  multiSelectActions: ComponentType<{
    rows: any[];
    refetch(): void;
    size?: ButtonSize;
  }> | null;
  /**
   * Optional columns the user can toggle for the active tab. When omitted or
   * empty the settings (gear) button renders disabled.
   */
  optionalColumns?: ExpandableRowToolbarColumn[];
  /**
   * Invoked after a bulk action's refetch so the parent can refresh derived
   * data the table query doesn't cover (e.g. the tab count badges).
   */
  onRefetch?: () => void;
}

const ColumnsPopover: FC<{
  columns: ExpandableRowToolbarColumn[];
  activeColumns: Record<string, string[] | false>;
  onToggle: (column: ExpandableRowToolbarColumn) => void;
}> = ({ columns, activeColumns, onToggle }) => (
  <div className="py-2 mw-250px">
    {columns.map((column) => (
      <button
        key={column.id}
        type="button"
        className={cn(
          menuItem({ look: 'actions' }),
          'd-flex align-items-center gap-2',
        )}
        aria-pressed={Boolean(activeColumns[column.id])}
        onClick={() => onToggle(column)}
      >
        {/* A visual only: the button is the control, and an input inside a
            button would be a second, nested one. */}
        <Checkbox
          size="sm"
          checked={Boolean(activeColumns[column.id])}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none"
        />
        {column.title}
      </button>
    ))}
  </div>
);

export const ExpandableRowToolbar: FC<ExpandableRowToolbarProps> = ({
  activeTableKey,
  multiSelectActions,
  optionalColumns,
  onRefetch,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const selectedRows = useSelector(
    activeTableKey ? selectSelectedRows(activeTableKey) : () => null,
  );
  const tableState = useSelector(
    activeTableKey ? getTableState(activeTableKey) : () => null,
  );
  const activeColumns = tableState?.activeColumns || {};
  const query = tableState?.query || '';

  const refetch = useCallback(() => {
    if (!activeTableKey) return;
    queryClient.invalidateQueries({ queryKey: ['table', activeTableKey] });
    dispatch(resetSelection(activeTableKey));
    onRefetch?.();
  }, [dispatch, queryClient, activeTableKey, onRefetch]);
  const clearSelection = useCallback(() => {
    if (!activeTableKey) return;
    dispatch(resetSelection(activeTableKey));
  }, [dispatch, activeTableKey]);
  const handleToggleColumn = useCallback(
    (column: ExpandableRowToolbarColumn) => {
      if (!activeTableKey) return;
      dispatch(toggleColumn(activeTableKey, column.id, { keys: column.keys }));
    },
    [dispatch, activeTableKey],
  );
  const handleSetQuery = useCallback(
    (newQuery: string) => {
      if (!activeTableKey) return;
      dispatch(setFilterQuery(activeTableKey, newQuery));
    },
    [dispatch, activeTableKey],
  );

  const hasSelection = Boolean(selectedRows && selectedRows.length > 0);
  const hasSettings = Boolean(optionalColumns && optionalColumns.length > 0);

  return (
    <div className="d-flex flex-wrap align-items-center gap-2 px-3 py-2">
      {activeTableKey && (
        <div className="table-toolbar-search expandable-row-search">
          <TableQuery query={query} setQuery={handleSetQuery} />
        </div>
      )}
      <div className="ms-sm-auto d-flex align-items-center gap-3">
        {hasSelection && (
          <div className="d-flex align-items-center fw-normal text-dark gap-2">
            <BaseButton
              iconNode={<XIcon weight="bold" />}
              tooltip={translate('Clear selection')}
              onClick={clearSelection}
              variant="text-secondary"
              size="sm"
            />
            <span className="fs-7">
              ({selectedRows.length}) {translate('Selected')}
            </span>
          </div>
        )}
        {hasSelection &&
          multiSelectActions &&
          createElement(multiSelectActions, {
            rows: selectedRows,
            refetch,
            size: 'md',
          })}
        <BaseButton
          iconNode={<FunnelSimpleIcon weight="bold" />}
          tooltip={translate('Filter')}
          onClick={() => {}}
          size="md"
          variant="tertiary"
        />
        {hasSettings ? (
          <Popover>
            {/* size="md" matches the disabled fallback branch below so the two
                stay visually consistent. */}
            <PopoverTrigger asChild>
              <BaseButton
                variant="tertiary"
                size="md"
                tooltip={translate('Toggle visible columns')}
                iconNode={<GearSixIcon weight="bold" />}
              />
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={2}
              className="table-columns-popover"
            >
              <ColumnsPopover
                columns={optionalColumns}
                activeColumns={activeColumns}
                onToggle={handleToggleColumn}
              />
            </PopoverContent>
          </Popover>
        ) : (
          <BaseButton
            iconNode={<GearSixIcon weight="bold" />}
            tooltip={translate('No columns to configure')}
            onClick={() => {}}
            disabled
            size="md"
            variant="tertiary"
          />
        )}
      </div>
    </div>
  );
};
