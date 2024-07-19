import { FunctionComponent, useCallback } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { change, getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';

import { TableProps } from './Table';
import { TableFiltersMenu } from './TableFiltersMenu';
import { getFiltersFormId } from './utils';

interface TableFiltersProps
  extends Pick<
    TableProps,
    | 'filters'
    | 'renderFiltersDrawer'
    | 'filtersStorage'
    | 'hideClearFilters'
    | 'filterPosition'
    | 'setFilter'
    | 'applyFiltersFn'
    | 'selectedSavedFilter'
  > {
  table?: TableProps['table'];
}

export const TableFilters: FunctionComponent<TableFiltersProps> = (props) => {
  const dispatch = useDispatch();
  const formId = getFiltersFormId(props.filters);
  const formValues = useSelector(getFormValues(formId));
  const clearFilters = useCallback(() => {
    if (formValues) {
      Object.keys(formValues).forEach((key) => {
        dispatch(change(formId, key, null));
        if (props.filterPosition === 'menu') {
          props.setFilter({
            label: null,
            name: key,
            value: null,
            component: null,
          });
        }
      });
    }
    if (props.filterPosition === 'sidebar') {
      props.renderFiltersDrawer(props.filters);
    }
  }, [dispatch, props, formValues]);

  return props.filterPosition === 'menu' || props.filtersStorage.length > 0 ? (
    <Row className="card-toolbar w-100 my-4">
      <Col xs={12} md="auto" className="order-md-1 mb-4 mb-md-0 text-end">
        {!props.hideClearFilters && props.filtersStorage.length > 0 && (
          <Button
            variant="flush"
            className="btn-active-text-primary"
            onClick={clearFilters}
          >
            {translate('Clear filters')}
          </Button>
        )}
      </Col>
      <Col className="d-flex flex-wrap gap-4">
        {props.filtersStorage.map((item) => (
          <Stack
            key={item.name}
            direction="horizontal"
            gap={2}
            className="flex-wrap fw-bold"
          >
            {item.label}
            <item.component />
          </Stack>
        ))}
        {props.filterPosition === 'menu' && (
          <TableFiltersMenu
            table={props.table}
            filters={props.filters}
            filterPosition={props.filterPosition}
            setFilter={props.setFilter}
            applyFiltersFn={props.applyFiltersFn}
            selectedSavedFilter={props.selectedSavedFilter}
          />
        )}
      </Col>
    </Row>
  ) : null;
};
