import { XIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@/core/constants';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

import { TableFiltersMenu } from './TableFiltersMenu';
import { TableProps } from './types';

interface TableFiltersProps extends Pick<
  TableProps,
  | 'filters'
  | 'formId'
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
  const form = useForm();
  const { values: formValues } = useFormState();

  const clearFilters = useCallback(() => {
    if (formValues) {
      Object.keys(formValues).forEach((key) => {
        form.change(key, null);
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
      props.renderFiltersDrawer(props.filters, props.formId);
    }
    props.applyFiltersFn(true);
  }, [props, formValues, form]);

  const isMd = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.md });
  const clearLabel = isMd ? translate('Clear') : translate('Clear filters');

  return props.filterPosition === 'menu' || props.filtersStorage.length > 0 ? (
    <Row className="w-100 g-0 gap-4">
      <Col className={isMd ? 'd-flex scroll-x' : 'd-flex'}>
        <div
          className={
            isMd
              ? 'd-flex align-items-stretch text-nowrap gap-4 w-100'
              : 'd-flex flex-wrap gap-4 w-100'
          }
        >
          {props.filtersStorage.map((item) => (
            <Stack
              key={item.name}
              direction="horizontal"
              gap={2}
              className="flex-nowrap fw-bolder text-dark fs-7"
            >
              {item.label}
              <item.component />
            </Stack>
          ))}
          {props.filterPosition === 'menu' && (
            <TableFiltersMenu
              table={props.table}
              filters={props.filters}
              formId={props.formId}
              filterPosition={props.filterPosition}
              filtersStorage={props.filtersStorage}
              setFilter={props.setFilter}
              applyFiltersFn={props.applyFiltersFn}
              selectedSavedFilter={props.selectedSavedFilter}
            />
          )}
        </div>
      </Col>
      {!props.hideClearFilters && props.filtersStorage.length > 0 && (
        <Col xs="auto" className="align-self-start text-end">
          <CompactActionButton
            variant="text-secondary"
            className="btn-no-focus"
            action={clearFilters}
            iconNode={<XIcon weight="bold" />}
            title={clearLabel}
          />
        </Col>
      )}
    </Row>
  ) : null;
};
