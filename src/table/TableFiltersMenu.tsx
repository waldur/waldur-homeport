import { CaretRight, FunnelSimple, Plus, Star } from '@phosphor-icons/react';
import { isEqual, throttle } from 'lodash';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/components';
import { openModalDialog } from '@waldur/modal/actions';

import { selectSavedFilter, setSavedFilters } from './actions';
import { SavedFilterSelect } from './SavedFilterSelect';
import { selectSelectedSavedFilter } from './selectors';
import { TableProps } from './Table';
import { TableFilterContext } from './TableFilterContainer';
import { TableFilterService } from './TableFilterService';
import { getFiltersFormId, getSavedFiltersKey } from './utils';

const SaveFilterDialog = lazyComponent(
  () => import('./SaveFilterDialog'),
  'SaveFilterDialog',
);

const SaveFilterItems = ({ table, formId, apply }) => {
  const dispatch = useDispatch();

  const formValues = useSelector(getFormValues(formId));
  const selectedSavedFilter = useSelector((state: any) =>
    selectSelectedSavedFilter(state, table),
  );
  const key = useMemo(() => getSavedFiltersKey(table, formId), [table, formId]);

  const saveFilter = useCallback(
    (name) => {
      let newItem;
      Object.entries(formValues).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length === 0) {
          delete formValues[key];
        }
      });
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
          id: `${table}-${formId}-${isoDate}`,
          title: name || formatDateTime(null),
          date: isoDate,
          values: formValues,
        };
      }

      TableFilterService.addOrReplace(key, newItem);
      dispatch(setSavedFilters(table, TableFilterService.list(key).reverse()));
      dispatch(selectSavedFilter(table, newItem));
    },
    [key, formValues, selectedSavedFilter, setSavedFilters, selectSavedFilter],
  );

  const onSaveFilter = (e) => {
    dispatch(
      openModalDialog(SaveFilterDialog, {
        resolve: {
          saveFilter,
        },
        size: 'sm',
      }),
    );
    e.stopPropagation();
  };

  const isDirty = useMemo(
    () =>
      selectedSavedFilter
        ? !isEqual(selectedSavedFilter.values, formValues)
        : false,
    [selectedSavedFilter, formValues],
  );

  return (
    <>
      <div
        className="menu-item"
        data-kt-menu-trigger="click"
        data-kt-menu-placement="right-start"
      >
        {selectedSavedFilter ? (
          <span
            className="menu-link"
            aria-hidden="true"
            onClick={isDirty ? saveFilter : null}
          >
            {isDirty ? translate('Update filter') : translate('Save filter')}
            <Star size={18} className="ms-auto text-warning" weight="fill" />
          </span>
        ) : (
          <span className="menu-link" aria-hidden="true" onClick={onSaveFilter}>
            {translate('Save filter')}
            <Star size={18} className="ms-auto" weight="bold" />
          </span>
        )}
      </div>
      <div
        className="menu-item"
        data-kt-menu-trigger="click"
        data-kt-menu-placement="right-start"
      >
        <span className="menu-link" aria-hidden="true">
          <span className="menu-title">{translate('Saved filters')}</span>
          <CaretRight size={18} className="ms-auto" weight="bold" />
        </span>

        <div className="menu-sub menu-sub-dropdown w-250px py-3">
          <div className="menu-item">
            <div
              className="menu-content filter-field"
              onClick={(e) => e.stopPropagation()}
              aria-hidden="true"
            >
              <SavedFilterSelect
                table={table}
                formId={formId}
                filterPosition="menu"
                onSelect={apply}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const openSubmenu = throttle(
  (menuInstance, item) => menuInstance.show(item),
  100,
  { leading: false },
);

interface TableFiltersMenuProps
  extends Pick<
    TableProps,
    'filters' | 'filterPosition' | 'setFilter' | 'applyFiltersFn'
  > {
  table?: TableProps['table'];
  selectedSavedFilter?: TableProps['selectedSavedFilter'];
  openName?: string;
}

export const TableFiltersMenu: FC<TableFiltersMenuProps> = (props) => {
  const filtersFormId = getFiltersFormId(props.filters);

  const menuEl = useRef<HTMLDivElement>(null);
  const menuInstance = useRef(null);

  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  // Add show/hide event listeners on menu
  useEffect(() => {
    if (menuEl?.current) {
      menuInstance.current = MenuComponent.getInstance(menuEl.current);
      if (menuInstance.current) {
        menuInstance.current.on('kt.menu.dropdown.shown', () => {
          props.applyFiltersFn(false);
          if (props.openName) {
            const item = menuEl.current.querySelector(
              '#filter-item-' + props.openName,
            );
            openSubmenu(menuInstance.current, item);
          }
        });
      }
    }
  }, [menuEl?.current]);

  const apply = () => {
    props.applyFiltersFn(true);
    menuInstance.current.hide(menuInstance.current.getElement());
  };

  const [existed, setExisted] = useState(true);
  useEffect(() => {
    if (props.openName && menuEl?.current) {
      const item = menuEl.current.querySelector(
        '#filter-item-' + props.openName,
      );
      if (!item) setExisted(false);
    }
  }, [menuEl?.current, props.openName, setExisted]);

  if (!existed) return null;

  return (
    <TableFilterContext.Provider
      value={{
        selectedSavedFilter: props.selectedSavedFilter,
        filterPosition: props.filterPosition,
        form: filtersFormId,
        setFilter: props.setFilter,
        apply,
      }}
    >
      {props.openName ? (
        <>
          <button
            className="text-anchor"
            data-kt-menu-trigger="click"
            data-kt-menu-attach="parent"
            data-kt-menu-placement="bottom"
            data-kt-menu-flip="bottom"
            data-cy={`${props.openName}-add-filter-button`}
          >
            <FunnelSimple size={17} width={30} />
          </button>
          <div
            ref={menuEl}
            className="table-filters-menu column-filter menu menu-sub menu-sub-dropdown menu-column menu-gray-600 menu-state-bg-light menu-state-primary fw-bold fs-6"
            data-kt-menu="true"
            data-cy={`${props.openName}-add-filter-menu`}
          >
            {props.filters}
          </div>
        </>
      ) : (
        <Tip id="table-add-filter-tip" label={translate('Add filter')}>
          <Button
            variant="outline"
            className="btn-outline-default btn-icon btn-add-filter w-40px h-40px"
            data-kt-menu-trigger="click"
            data-kt-menu-attach="parent"
            data-kt-menu-placement="bottom-start"
            data-cy="table-add-filter-button"
          >
            <Plus size={28} />
          </Button>
          <div
            ref={menuEl}
            className="table-filters-menu menu menu-sub menu-sub-dropdown menu-column menu-grey-700 menu-state-bg-light menu-state-primary fw-bold py-1 fs-6 w-250px"
            data-kt-menu="true"
            data-cy="table-add-filter-menu"
          >
            <SaveFilterItems
              table={props.table}
              formId={filtersFormId}
              apply={() => props.applyFiltersFn(true)}
            />
            <div className="separator" />
            {props.filters}
          </div>
        </Tip>
      )}
    </TableFilterContext.Provider>
  );
};
