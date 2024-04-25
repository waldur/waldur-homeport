import React from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { selectSavedFilter, setSavedFilters } from './actions';
import { selectSelectedSavedFilter } from './selectors';
import { TableFilterService } from './TableFilterService';
import { getFiltersFormId, getSavedFiltersKey } from './utils';

interface TableFilterActionsProps {
  filters: JSX.Element;
  table: string;
  apply: () => any;
  close(): void;
}

export const TableFilterActions: React.FC<TableFilterActionsProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const filtersFormId = getFiltersFormId(props.filters);

  const formValues = useSelector(getFormValues(filtersFormId));

  const selectedSavedFilter = useSelector((state: any) =>
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

  const applyCallback = () => {
    props.close();
    props.apply();
  };

  return (
    <Stack direction="horizontal" gap={2}>
      <Button
        variant="active-light-primary"
        className="btn-text-primary me-auto"
        size="sm"
        onClick={saveFilter}
      >
        {selectedSavedFilter
          ? translate('Update filter')
          : translate('Save filter')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="btn-outline-primary btn-active-light-primary"
        onClick={props.close}
      >
        {translate('Cancel')}
      </Button>
      <Button size="sm" onClick={applyCallback}>
        {translate('Apply')}
      </Button>
    </Stack>
  );
};
