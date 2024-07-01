import { FunctionComponent, useCallback } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { change, getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';

import { TableProps } from './Table';
import { getFiltersFormId } from './utils';

interface TableFiltersProps
  extends Pick<
    TableProps,
    'filters' | 'renderFiltersDrawer' | 'filtersStorage' | 'hideClearFilters'
  > {}

export const TableFilters: FunctionComponent<TableFiltersProps> = (props) => {
  const dispatch = useDispatch();
  const formId = getFiltersFormId(props.filters);
  const formValues = useSelector(getFormValues(formId));
  const clearFilters = useCallback(() => {
    if (formValues) {
      Object.keys(formValues).forEach((key) => {
        dispatch(change(formId, key, null));
      });
    }
    props.renderFiltersDrawer(props.filters);
  }, [dispatch, props, formValues]);

  return props.filtersStorage.length > 0 ? (
    <Row className="card-toolbar w-100 my-4">
      <Col xs={12} md="auto" className="order-md-1 mb-4 mb-md-0 text-end">
        {!props.hideClearFilters && (
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
      </Col>
    </Row>
  ) : null;
};
