import { isEqual } from 'es-toolkit';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { translate } from 'waldur-i18n-runtime';
import { useNotify } from 'waldur-notifications';
import { useModal } from 'waldur-ui';

import { isEmpty, orderByFilter } from '@/core/utils';
import { fetchAll } from '@/table/api';

import { DASH_ESCAPE_CODE } from './constants';
import exportAs from './exporters';
import { ExportConfig } from './exporters/types';
import { getTableOptions } from './registry';
import { getTableState } from './selectors';
import { TableFullExport, TableOptionsType, TableRequest } from './types';

/** The table's columns as an automatic export writes them: in the user's
 * order, only the enabled ones, without those marked `export: false`. */
function getExportColumns(props) {
  let exportColumns = [];
  // Apply order of columns
  if (
    props.columnPositions &&
    !isEmpty(props.columnPositions.filter(Boolean))
  ) {
    props.columnPositions.forEach((colName) => {
      const column = props.columns.find((col) => col.id === colName);
      if (column) {
        exportColumns.push(column);
      }
    });
  } else {
    exportColumns = props.columns ?? [];
  }

  // Apply enabled columns
  if (props.activeColumns && !isEmpty(props.activeColumns)) {
    const activeColumnsKeys = Object.values(props.activeColumns);
    exportColumns = exportColumns.filter((col) =>
      activeColumnsKeys.some((keys) => isEqual(keys, col.keys)),
    );
  }

  // Remove false columns
  return exportColumns.filter((col) => col.export !== false);
}

/** How many columns an export of this table holds, known before any row is
 * fetched. Undefined for a table whose own exportRow sets them. */
export function getExportColumnCount(
  table: string | undefined,
  props,
): number | undefined {
  const { exportFields, exportRow } = table
    ? getTableOptions(table)
    : ({} as TableOptionsType);
  if (exportFields) {
    const fields =
      typeof exportFields === 'function' ? exportFields(props) : exportFields;
    return fields?.length;
  }
  if (exportRow) {
    return undefined;
  }
  return getExportColumns(props ?? {}).length;
}

/** Exports the table. The run stops when `abort` is called or the dialog
 * using the hook unmounts: no file, no toast, no `closeDialog`. `table` is
 * left out when the dialog offers only `props.fullExport`. */
export function useTableExport(table: string | undefined, props?) {
  const { closeDialog } = useModal();
  const controller = useRef<AbortController>(undefined);
  const [progress, setProgress] = useState<{
    fetched: number;
    total: number;
  }>();
  const abort = () => controller.current?.abort();
  useEffect(() => abort, []);
  const { showSuccess, showErrorResponse } = useNotify();
  const {
    exportFields,
    exportKeys,
    exportRow,
    exportData,
    fetchData,
    ...options
  } = table ? getTableOptions(table) : ({} as TableOptionsType);

  const tableState = useSelector(getTableState(table));
  // The rows on screen, from the table that opened the dialog; all-pages export
  // fetches its own below.
  let rows = props?.rows ?? [];
  const customExport = Boolean(exportFields || exportRow);

  /** The table's own list request for every page: its filters, search term
   * and sorting. */
  function buildRequest(signal: AbortSignal): TableRequest {
    // Use current filter from props (passed from Table component) instead of
    // stale filter from registry, as the registry filter is captured only once
    // when the table is first registered. Also check tableExtraFilters for
    // cases where filter was set via Redux action.
    const currentFilter = props?.filter ?? options.filter;
    const request: TableRequest = {
      tableKey: table,
      pageSize: Math.max(tableState.pagination.resultCount, 200),
      currentPage: 1,
      filter: { ...currentFilter },
      options: { signal },
    };
    if (options.queryField && tableState.query) {
      request.filter[options.queryField] = tableState.query;
    }
    if (tableState.sorting && tableState.sorting.field) {
      request.filter.o = orderByFilter(tableState.sorting);
    }
    return request;
  }

  const onProgress = (fetched: number, total: number) =>
    setProgress({ fetched, total });

  /** Every field the API returns. The rows on screen were fetched with only
   * the visible columns' fields, so the current page is fetched again too. */
  async function fetchApiRows(config: ExportConfig, signal: AbortSignal) {
    const request = buildRequest(signal);
    delete request.filter.field;
    if (config.allPages) {
      return fetchAll(fetchData, request, onProgress);
    }
    request.currentPage = tableState.pagination.currentPage;
    request.pageSize = tableState.pagination.pageSize;
    return (await fetchData(request)).rows;
  }

  async function fetchRows(config, signal: AbortSignal) {
    const exportColumns = customExport ? [] : getExportColumns(props);

    if (config.allPages) {
      const request = buildRequest(signal);

      if (customExport) {
        if (exportKeys && exportKeys.length > 0) {
          request.filter.field = exportKeys;
        }
      } else if (exportColumns.length > 0) {
        const autoExportKeys = [];
        exportColumns.map((col) => {
          if (typeof col.export === 'string') {
            autoExportKeys.push(col.export);
          } else if (col.exportKeys) {
            autoExportKeys.push(col.exportKeys);
          } else if (col.keys) {
            autoExportKeys.push(col.keys);
          }
        });
        if (autoExportKeys.length > 0) {
          request.filter.field = autoExportKeys;
        }
      }

      rows = await fetchAll(fetchData, request, onProgress);
    }

    let data;
    if (exportFields || exportRow) {
      // Generate custom export data
      const fields =
        typeof exportFields === 'function' ? exportFields(props) : exportFields;

      data = {
        fields,
        data: exportData
          ? exportData(rows, props)
          : rows.map((row) => exportRow(row, props)),
      };
    } else {
      // Generate export data automatically
      const fields = exportColumns.map(
        (col) =>
          col.exportTitle ||
          (typeof col.title === 'string' ? col.title : col.id),
      );

      data = {
        fields,
        data: rows.map((row) =>
          exportColumns.map((col) => {
            if (col.export && typeof col.export === 'function') {
              return col.export(row);
            }
            const value =
              row[col.export] ||
              row[col.keys ? col.keys[0] : null] ||
              row[col.orderField] ||
              row[col.id];

            if (
              typeof value === 'string' ||
              [null, undefined].includes(value)
            ) {
              return value || DASH_ESCAPE_CODE;
            } else {
              return value;
            }
          }),
        ),
      };
    }
    return data;
  }

  const exportTable = async (config: ExportConfig) => {
    controller.current = new AbortController();
    const { signal } = controller.current;
    setProgress(undefined);
    // The server writes this one; nothing to assemble from the rows.
    const fullExport: TableFullExport = props?.fullExport;
    if (config.content === 'full' && fullExport) {
      try {
        await fullExport.download({ query: tableState.query, signal });
        if (signal.aborted) return;
        showSuccess(
          fullExport.format
            ? translate('{name} has been exported.', {
                name: fullExport.label,
              })
            : translate('Table has been exported to {format}.', {
                format: 'CSV',
              }),
        );
        closeDialog();
      } catch (e) {
        if (signal.aborted) return;
        showErrorResponse(
          e,
          fullExport.errorMessage ?? translate('Unable to export table.'),
        );
      }
      return;
    }
    try {
      if (config.format === 'json') {
        const { default: saveAsJson } = await import('./exporters/json');
        const rows = await fetchApiRows(config, signal);
        if (signal.aborted) return;
        saveAsJson(table, rows);
      } else {
        const data = await fetchRows(config, signal);
        if (signal.aborted) return;
        await exportAs(config.format, table, data);
      }
      if (signal.aborted) return;
      showSuccess(
        translate('Table has been exported to {format}.', {
          format: config.format,
        }),
      );
      closeDialog();
    } catch (e) {
      if (signal.aborted) return;
      showErrorResponse(e, translate('Unable to export table.'));
    }
  };

  return { exportTable, abort, progress };
}
