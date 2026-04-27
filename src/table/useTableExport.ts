import { isEqual } from 'lodash-es';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { isEmpty, orderByFilter } from '@/core/utils';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { showSuccess, showErrorResponse } from '@/store/notify';
import { type RootState } from '@/store/reducers';
import { fetchAll } from '@/table/api';

import { DASH_ESCAPE_CODE } from './constants';
import exportAs from './exporters';
import { ExportConfig } from './exporters/types';
import { tableExtraFilters } from './middleware';
import { getTableOptions } from './registry';
import { makeSelectTableRows, getTableState } from './selectors';
import { TableRequest } from './types';

export function useTableExport(table, props?) {
  const {
    exportFields,
    exportKeys,
    exportRow,
    exportData,
    fetchData,
    ...options
  } = getTableOptions(table);

  const tableState = useSelector(getTableState(table));
  const selectRows = useMemo(() => makeSelectTableRows(), []);
  let rows = useSelector((state: RootState) => selectRows(state, table));
  const customExport = Boolean(exportFields || exportRow);

  async function fetchRows(config) {
    // Calculate array for export data automatically
    let exportColumns = [];
    if (!customExport) {
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
        exportColumns = props.columns;
      }

      // Apply enabled columns
      if (props.activeColumns && !isEmpty(props.activeColumns)) {
        const activeColumnsKeys = Object.values(props.activeColumns);
        exportColumns = exportColumns.filter((col) =>
          activeColumnsKeys.some((keys) => isEqual(keys, col.keys)),
        );
      }

      // Remove false columns
      exportColumns = exportColumns.filter((col) => col.export !== false);
    }

    if (config.allPages) {
      // Use current filter from props (passed from Table component) instead of
      // stale filter from registry, as the registry filter is captured only once
      // when the table is first registered. Also check tableExtraFilters for
      // cases where filter was set via Redux action.
      const currentFilter =
        props?.filter ?? tableExtraFilters[table] ?? options.filter;
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

  const dispatch = useDispatch();
  return async (config: ExportConfig) => {
    try {
      const data = await fetchRows(config);
      await exportAs(config.format, table, data);
      dispatch(
        showSuccess(
          translate('Table has been exported to {format}.', {
            format: config.format,
          }),
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to export table.')));
    }
  };
}
