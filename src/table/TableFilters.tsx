import { FunctionComponent, useCallback } from 'react';
import { Badge, Button, Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { change, getFormValues } from 'redux-form';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
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

  const isMd = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.md });

  return props.filterPosition === 'menu' || props.filtersStorage.length > 0 ? (
    <Row className="card-toolbar w-100 my-4 g-0 gap-4">
      <Col className={isMd ? 'd-flex scroll-x' : 'd-flex'}>
        <div
          className={
            isMd
              ? 'd-flex align-items-stretch text-nowrap gap-4 w-100'
              : 'd-flex flex-wrap gap-4 w-100'
          }
        >
          {props.filtersStorage.map((item) => (
            <Badge
              key={item.name}
              bg="light"
              className={
                'min-h-40px d-flex align-items-center pe-0' +
                (isMd ? '' : ' flex-wrap')
              }
            >
              <span className="text-grey-700 fw-bold">{item.label}:</span>
              <item.component />
            </Badge>
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
        </div>
      </Col>
      {!props.hideClearFilters && props.filtersStorage.length > 0 && (
        <Col xs="auto" className="align-self-start text-end">
          <Button
            variant="flush"
            className="btn-active-text-primary h-40px"
            onClick={clearFilters}
          >
            {isMd ? translate('Clear') : translate('Clear filters')}
          </Button>
        </Col>
      )}
    </Row>
  ) : null;
};
