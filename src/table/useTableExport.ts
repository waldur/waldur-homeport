import { isEqual } from 'es-toolkit';
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
import { TableRequest } from './types';

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
export function getExportColumnCount(table, props): number | undefined {
  const { exportFields, exportRow } = getTableOptions(table);
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

export function useTableExport(table, props?) {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const {
    exportFields,
    exportKeys,
    exportRow,
    exportData,
    fetchData,
    ...options
  } = getTableOptions(table);

  const tableState = useSelector(getTableState(table));
  // The rows on screen, from the table that opened the dialog; all-pages export
  // fetches its own below.
  let rows = props?.rows ?? [];
  const customExport = Boolean(exportFields || exportRow);

  async function fetchRows(config) {
    const exportColumns = customExport ? [] : getExportColumns(props);

    if (config.allPages) {
      // Use current filter from props (passed from Table component) instead of
      // stale filter from registry, as the registry filter is captured only once
      // when the table is first registered. Also check tableExtraFilters for
      // cases where filter was set via Redux action.
      const currentFilter = props?.filter ?? options.filter;
      const request: TableRequest = {
        tableKey: table,
        pageSize: Math.max(tableState.pagination.resultCount, 200),
        currentPage: 1,
        filter: config.withFilters ? { ...currentFilter } : {},
      };
      if (config.withFilters && options.queryField && tableState.query) {
        request.filter[options.queryField] = tableState.query;
      }
      if (tableState.sorting && tableState.sorting.field) {
        request.filter.o = orderByFilter(tableState.sorting);
      }

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

      rows = await fetchAll(fetchData, request);
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

  return async (config: ExportConfig) => {
    try {
      // The server writes this one; nothing to assemble from the rows.
      if (config.content === 'full' && props?.fullExport) {
        await props.fullExport.download({
          withFilters: Boolean(config.withFilters),
          query: config.withFilters ? tableState.query : undefined,
        });
        showSuccess(
          translate('Table has been exported to {format}.', { format: 'CSV' }),
        );
        closeDialog();
        return;
      }
      const data = await fetchRows(config);
      await exportAs(config.format, table, data);
      showSuccess(
        translate('Table has been exported to {format}.', {
          format: config.format,
        }),
      );
      closeDialog();
    } catch (e) {
      showErrorResponse(e, translate('Unable to export table.'));
    }
  };
}
