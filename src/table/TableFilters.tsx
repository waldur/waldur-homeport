import { XIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { BaseButton, useBreakpointDown } from 'waldur-ui';

import { translate } from '@/i18n';

import { clearAllFilters } from './actions';
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
  const dispatch = useDispatch();

  const clearFilters = useCallback(() => {
    dispatch(clearAllFilters(props.table));
    if (props.filterPosition === 'sidebar') {
      props.renderFiltersDrawer(props.filters, props.formId);
    }
    props.applyFiltersFn(true);
  }, [props, dispatch]);

  const isMd = useBreakpointDown('md');
  const clearLabel = isMd ? translate('Clear') : translate('Clear filters');

  return props.filterPosition === 'menu' || props.filtersStorage.length > 0 ? (
    <div className="w-100 d-flex flex-wrap gap-4">
      <div
        className={isMd ? 'd-flex flex-grow-1 scroll-x' : 'd-flex flex-grow-1'}
      >
        <div
          className={
            isMd
              ? 'd-flex align-items-stretch text-nowrap gap-4 w-100'
              : 'd-flex flex-wrap gap-4 w-100'
          }
        >
          {props.filtersStorage.map((item) => (
            <div
              key={item.name}
              className="d-flex align-items-center flex-nowrap fw-bolder text-dark fs-7 gap-2"
            >
              {item.label}
              {item.component && <item.component />}
            </div>
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
      </div>
      {!props.hideClearFilters && props.filtersStorage.length > 0 && (
        <div className="align-self-start text-end">
          <BaseButton
            variant="text-secondary"
            className="btn-no-focus"
            onClick={clearFilters}
            iconNode={<XIcon weight="bold" />}
            label={clearLabel}
            size="sm"
          />
        </div>
      )}
    </div>
  ) : null;
};
