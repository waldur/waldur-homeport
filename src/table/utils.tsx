import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n/translate';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { ExportData } from './exporters/types';
import { Column } from './types';

export const getId = (row, index) => {
  if (row.uuid) {
    return row.uuid;
  } else if (row.pk) {
    return row.pk;
  }
  return index;
};

export const formatLongText = (value) =>
  value && value.length > 100 ? (
    <Tip label={value} id="longText">
      <span className="ellipsis d-inline-block" style={{ width: 150 }}>
        {value}
      </span>
    </Tip>
  ) : (
    value
  );

export const transformRows = (rows: any[]) => {
  const entities: object = {};
  const order: any[] = [];
  rows.forEach((row, index) => {
    entities[getId(row, index)] = row;
    order.push(getId(row, index));
  });
  return { entities, order };
};

export const renderFieldOrDash = (field) => (field ? field : DASH_ESCAPE_CODE);

export function getNoResultMessage({ query, verboseName, customEmpty = null }) {
  const context = {
    verboseName: String(verboseName || translate('Items')).toLowerCase(),
    query: query,
  };
  if (query) {
    return translate(
      'Your search "{query}" did not match any {verboseName}.',
      context,
    );
  } else {
    return customEmpty || translate('There are no {verboseName} yet.', context);
  }
}

export function getNoResultTitle({ verboseName, hasFilter = false }) {
  const context = {
    verboseName: String(verboseName || translate('Items')).toLowerCase(),
  };
  if (hasFilter) {
    return translate(
      'No {verboseName} found matching current filters',
      context,
    );
  }
  return translate('No {verboseName} found', context);
}

export const getFiltersFormId = (filters: JSX.Element) => {
  if (!filters) return '';
  return filters.props?.form;
};

export const getSavedFiltersKey = (table, formId) =>
  `waldur/table/filters/${table}/${formId}`;

export const getSimpleExportData = <T = any,>(
  columns: Column<T>[],
  rows: T[],
): ExportData => {
  const fields = columns
    .filter((column) => column.export !== false)
    .map((column) => column.exportTitle || (column.title as string));
  const data = (rows || []).map((row) =>
    columns
      .filter((column) => column.export !== false)
      .map((column) => {
        if (typeof column.export === 'function') {
          return (column.export as any)(row);
        } else if (typeof column.export === 'string') {
          return row[column.export];
        } else if (column.export === true || column.export === undefined) {
          return (
            (column.id && row[column.id]) ||
            (column.orderField && row[column.orderField])
          );
        }
        return '';
      }),
  );
  return { fields, data } as ExportData;
};
