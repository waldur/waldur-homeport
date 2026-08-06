import { FunnelSimpleIcon, GearSixIcon, XIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { ComponentType, FC, createElement, useCallback } from 'react';
import {
  Button,
  FormCheck,
  OverlayTrigger,
  Popover,
  Stack,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { CompactIconButton, MediumIconButton } from '@/core/buttons/IconButton';
import { Tip } from '@/core/Tooltip';
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
    className?: string;
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
        className="dropdown-item d-flex align-items-center gap-2"
        onClick={() => onToggle(column)}
      >
        <FormCheck
          className="form-check form-check-custom form-check-sm min-h-auto"
          checked={Boolean(activeColumns[column.id])}
          onChange={(e) => e.preventDefault()}
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
          <Stack
            direction="horizontal"
            className="fw-normal text-dark gap-2 align-items-center"
          >
            <CompactIconButton
              iconNode={<XIcon weight="bold" />}
              tooltip={translate('Clear selection')}
              onClick={clearSelection}
              variant="text-secondary"
            />
            <span className="fs-7">
              ({selectedRows.length}) {translate('Selected')}
            </span>
          </Stack>
        )}
        {hasSelection &&
          multiSelectActions &&
          createElement(multiSelectActions, {
            rows: selectedRows,
            refetch,
            className: 'btn-md',
          })}
        <MediumIconButton
          iconNode={<FunnelSimpleIcon weight="bold" />}
          tooltip={translate('Filter')}
          onClick={() => {}}
        />
        {hasSettings ? (
          <OverlayTrigger
            trigger="click"
            placement="bottom-end"
            rootClose
            overlay={
              <Popover
                id={`expandable-row-settings-popover-${activeTableKey ?? 'none'}`}
              >
                <ColumnsPopover
                  columns={optionalColumns}
                  activeColumns={activeColumns}
                  onToggle={handleToggleColumn}
                />
              </Popover>
            }
          >
            <span className="d-inline-flex">
              <Tip
                label={translate('Toggle visible columns')}
                id="expandable-row-settings-tip"
              >
                <Button
                  variant="tertiary"
                  size="sm"
                  type="button"
                  aria-label={translate('Toggle visible columns')}
                  className="btn-icon btn-icon-md"
                >
                  <span className="svg-icon svg-icon-2">
                    <GearSixIcon weight="bold" />
                  </span>
                </Button>
              </Tip>
            </span>
          </OverlayTrigger>
        ) : (
          <MediumIconButton
            iconNode={<GearSixIcon weight="bold" />}
            tooltip={translate('No columns to configure')}
            onClick={() => {}}
            disabled
          />
        )}
      </div>
    </div>
  );
};
