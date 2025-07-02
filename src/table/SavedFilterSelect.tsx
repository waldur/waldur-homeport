import { FunnelIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { components, OptionProps } from 'react-select';
import { change, clearFields, getFormValues, reset } from 'redux-form';

import {
  REACT_SELECT_TABLE_FILTER,
  WindowedSelect,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';

import { selectSavedFilter, setSavedFilters } from './actions';
import {
  selectSelectedSavedFilter,
  selectTableSavedFilters,
} from './selectors';
import { TableFilterService, TableFiltersGroup } from './TableFilterService';
import { TableProps } from './types';
import { getSavedFiltersKey } from './utils';

import './SavedFilterSelect.scss';

const Control = (props) => (
  <div className="d-flex align-items-center gap-2">
    <components.Control {...props} className={props.className + ' flex-grow-1'}>
      <span className="svg-icon svg-icon-2 svg-icon-gray-700 ms-3">
        <FunnelIcon weight="bold" />
      </span>
      {props.children}
    </components.Control>
    {Boolean(props.getValue()[0]) && (
      <Button
        variant="active-light-danger"
        size="sm"
        className="btn-icon btn-text-danger btn-icon-danger me-3"
        onClick={(e) => props.remove(e, props.getValue()[0])}
      >
        <span className="svg-icon svg-icon-2">
          <TrashIcon weight="bold" />
        </span>
      </Button>
    )}
  </div>
);

const ListOption: FC<OptionProps & { remove }> = (props) => (
  <components.Option {...props}>
    <div className="d-flex justify-content-between align-items-center">
      {props.children}
      <Button
        variant="active-light-danger"
        size="sm"
        className="btn-remove btn-icon btn-text-danger btn-icon-danger"
        onClick={(e) => props.remove(e, props.getValue()[0])}
      >
        <span className="svg-icon svg-icon-2">
          <TrashIcon weight="bold" />
        </span>
      </Button>
    </div>
  </components.Option>
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
      const deselect = selected && value?.id === selected.id;
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
      if (!deselect || !value) {
        dispatch(selectSavedFilter(table, value));
        onSelect && onSelect();
      } else {
        dispatch(selectSavedFilter(table, null));
      }
    },
    [table, formId, formValues, key, onSelect, selected],
  );

  const remove = useCallback(
    async (e, item) => {
      e.stopPropagation();
      try {
        await waitForConfirmation(
          dispatch,
          translate('Delete filter'),
          translate(
            'Are you sure you want to delete this filter? This action cannot be undone.',
          ),
          { forDeletion: true },
        );
      } catch {
        return;
      }
      try {
        TableFilterService.remove(key, item);
        setSelected(null);
        onSelect && onSelect();
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to remove the filter.')),
        );
      }
    },
    [dispatch, setSelected, key, onSelect],
  );

  return (
    <div
      className={
        filterPosition === 'menu' ? 'saved-filters' : 'saved-filters mb-7'
      }
    >
      <WindowedSelect
        value={selected}
        onChange={setSelected}
        placeholder={translate('Select saved filter')}
        getOptionLabel={(option) => option.title}
        getOptionValue={(option) => option.id}
        options={list || []}
        isClearable={true}
        noOptionsMessage={() => translate('No saved filter')}
        {...(filterPosition === 'menu' ? REACT_SELECT_TABLE_FILTER : {})}
        components={
          filterPosition === 'menu'
            ? {
                ...REACT_SELECT_TABLE_FILTER.components,
                Option: (props) => <ListOption {...props} remove={remove} />,
              }
            : {
                Control: (props) => <Control {...props} remove={remove} />,
              }
        }
      />
    </div>
  );
};
