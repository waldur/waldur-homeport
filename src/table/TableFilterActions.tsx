import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from 'waldur-i18n-runtime';
import { BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';

import { selectSavedFilter, setSavedFilters } from './actions';
import { TableFilterContext } from './FilterContextProvider';
import { selectFilterValues, selectSelectedSavedFilter } from './selectors';
import { TableFilterService } from './TableFilterService';
import { TablesRootState } from './types';
import { getSavedFiltersKey } from './utils';

interface TableFilterActionsProps {
  filters: JSX.Element;
  table: string;
  /** Applies the filters and closes the panel. */
  apply: () => any;
  /** Closes the panel, discarding the changes made in it. */
  close(): void;
}

export const TableFilterActions: React.FC<TableFilterActionsProps> = (
  props,
) => {
  const context = useContext(TableFilterContext);
  const filtersFormId = context.form || '';

  const dispatch = useDispatch();

  const formValues = useSelector(selectFilterValues(props.table)) || {};

  const selectedSavedFilter = useSelector((state: TablesRootState) =>
    selectSelectedSavedFilter(state, props.table),
  );

  const saveFilter = () => {
    let newItem;
    if (selectedSavedFilter) {
      // Update
      newItem = {
        ...selectedSavedFilter,
        date: new Date().toISOString(),
        values: formValues,
      };
    } else {
      // New
      const isoDate = new Date().toISOString();
      newItem = {
        id: `${props.table}-${filtersFormId}-${isoDate}`,
        title: formatDateTime(null),
        date: isoDate,
        values: formValues,
      };
    }

    const key = getSavedFiltersKey(props.table, filtersFormId);

    TableFilterService.addOrReplace(key, newItem);
    dispatch(
      setSavedFilters(props.table, TableFilterService.list(key).reverse()),
    );
    dispatch(selectSavedFilter(props.table, newItem));
  };

  return (
    <div className="flex items-center gap-2">
      <BaseButton
        size="sm"
        variant="text-primary"
        className="me-auto"
        onClick={saveFilter}
        label={
          selectedSavedFilter
            ? translate('Update filter')
            : translate('Save filter')
        }
      />
      <BaseButton
        size="sm"
        variant="secondary"
        onClick={props.close}
        label={translate('Cancel')}
      />
      <BaseButton
        size="sm"
        variant="primary"
        onClick={props.apply}
        label={translate('Apply')}
      />
    </div>
  );
};
