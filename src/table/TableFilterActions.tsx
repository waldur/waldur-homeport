import React, { useContext } from 'react';
import { Stack } from 'react-bootstrap';
import { useFormState } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import { formatDateTime } from '@/core/dateUtils';
import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';

import { selectSavedFilter, setSavedFilters } from './actions';
import { TableFilterContext } from './FilterContextProvider';
import { selectSelectedSavedFilter } from './selectors';
import { TableFilterService } from './TableFilterService';
import { getSavedFiltersKey } from './utils';

interface TableFilterActionsProps {
  filters: JSX.Element;
  table: string;
  apply: () => any;
  close(): void;
}

export const TableFilterActions: React.FC<TableFilterActionsProps> = (
  props,
) => {
  const context = useContext(TableFilterContext);
  const filtersFormId = context.form || '';

  const dispatch = useDispatch();

  const { values: formValues = {} } = useFormState({
    subscription: { values: true },
  });

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
      <CompactSubmitButton
        submitting={false}
        variant="text-primary"
        className="me-auto"
        onClick={saveFilter}
        type="button"
        label={
          selectedSavedFilter
            ? translate('Update filter')
            : translate('Save filter')
        }
      />
      <CompactSubmitButton
        submitting={false}
        variant="secondary"
        onClick={props.close}
        type="button"
        label={translate('Cancel')}
      />
      <CompactSubmitButton
        submitting={false}
        onClick={applyCallback}
        type="button"
        label={translate('Apply')}
      />
    </Stack>
  );
};
