import { Funnel, Trash } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { components } from 'react-select';
import { change, clearFields, getFormValues, reset } from 'redux-form';

import {
  REACT_SELECT_TABLE_FILTER,
  WindowedSelect,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { selectSavedFilter, setSavedFilters } from './actions';
import {
  selectSelectedSavedFilter,
  selectTableSavedFilters,
} from './selectors';
import { TableProps } from './Table';
import { TableFilterService, TableFiltersGroup } from './TableFilterService';
import { getSavedFiltersKey } from './utils';

const Control = (props) => (
  <components.Control {...props}>
    <span className="svg-icon svg-icon-2 svg-icon-gray-700 ms-3">
      <Funnel />
    </span>
    {props.children}
    {Boolean(props.getValue()[0]) && (
      <Button
        variant="active-danger"
        size="sm"
        className="btn-icon btn-text-danger me-3"
        onClick={() => props.remove(props.getValue()[0])}
      >
        <span className="svg-icon svg-icon-2">
          <Trash />
        </span>
      </Button>
    )}
  </components.Control>
);

interface SavedFilterSelectProps {
  table: string;
  formId: string;
  filterPosition?: TableProps['filterPosition'];
  onSelect?(): void;
}

export const SavedFilterSelect = ({
  table,
  formId,
  filterPosition,
  onSelect,
}: SavedFilterSelectProps) => {
  const dispatch = useDispatch();

  const formValues = useSelector(getFormValues(formId));

  const key = useMemo(() => getSavedFiltersKey(table, formId), [table, formId]);

  useEffect(() => {
    dispatch(setSavedFilters(table, TableFilterService.list(key).reverse()));
  }, [table, key]);

  const list = useSelector((state: any) =>
    selectTableSavedFilters(state, table),
  );
  const selected = useSelector((state: any) =>
    selectSelectedSavedFilter(state, table),
  );
  const setSelected = useCallback(
    (value: TableFiltersGroup) => {
      if (value) {
        if (formValues) {
          dispatch(clearFields(formId, true, true, ...Object.keys(formValues)));
        }
        Object.entries(value.values).forEach((field) => {
          dispatch(change(formId, field[0], field[1]));
        });
      } else {
        dispatch(reset(formId));
      }
      dispatch(setSavedFilters(table, TableFilterService.list(key).reverse()));
      dispatch(selectSavedFilter(table, value));
      onSelect && onSelect();
    },
    [table, formId, formValues, key, onSelect],
  );

  const remove = useCallback(
    (item) => {
      TableFilterService.remove(key, item);
      setSelected(null);
      onSelect && onSelect();
    },
    [setSelected, key, onSelect],
  );

  return (
    <div className={filterPosition === 'menu' ? '' : 'mb-7'}>
      <WindowedSelect
        value={selected}
        onChange={setSelected}
        components={{
          Control: (props) => <Control {...props} remove={remove} />,
        }}
        placeholder={translate('Select saved filter')}
        getOptionLabel={(option) => option.title}
        getOptionValue={(option) => option.id}
        options={list || []}
        isClearable={true}
        noOptionsMessage={() => translate('No saved filter')}
        {...(filterPosition === 'menu' ? REACT_SELECT_TABLE_FILTER : {})}
      />
    </div>
  );
};
