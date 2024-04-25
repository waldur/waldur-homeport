import { useCallback, useEffect, useMemo } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import SVG from 'react-inlinesvg';
import { useDispatch, useSelector } from 'react-redux';
import { components } from 'react-select';
import { change, clearFields, getFormValues, reset } from 'redux-form';

import { WindowedSelect } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { selectSavedFilter, setSavedFilters } from './actions';
import {
  selectSelectedSavedFilter,
  selectTableSavedFilters,
} from './selectors';
import { TableFilterService, TableFiltersGroup } from './TableFilterService';
import { getSavedFiltersKey } from './utils';

const Icon = require('./filter-outline.svg');

export const Control = (props) => (
  <components.Control {...props}>
    <span className="svg-icon svg-icon-2 svg-icon-gray-700 ps-3">
      <SVG src={Icon} />
    </span>
    {props.children}
  </components.Control>
);

export const SavedFilterSelect = ({ table, formId }) => {
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
    },
    [table, formId, formValues, key],
  );

  const remove = useCallback(() => {
    TableFilterService.remove(key, selected);
    setSelected(null);
  }, [selected, setSelected, key]);

  return (
    <Row className="mb-7">
      <Col>
        <WindowedSelect
          value={selected}
          onChange={setSelected}
          components={{ Control }}
          placeholder={translate('Select saved filter')}
          getOptionLabel={(option) => option.title}
          getOptionValue={(option) => option.id}
          options={list || []}
          isClearable={true}
          noOptionsMessage={() => translate('No saved filter')}
        />
      </Col>
      {selected && (
        <Col xs="auto" className="ps-0">
          <Button variant="light-danger" className="btn-icon" onClick={remove}>
            <i className="fa fa-trash-o fs-2"></i>
          </Button>
        </Col>
      )}
    </Row>
  );
};
