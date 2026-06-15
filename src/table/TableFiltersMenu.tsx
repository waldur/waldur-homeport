import {
  ArrowsClockwiseIcon,
  CaretRightIcon,
  FunnelSimpleIcon,
  PlusIcon,
  StarIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { throttle } from 'lodash-es';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { MenuComponent } from '@/metronic/components';
import { useModal } from '@/modal/actions';

import { selectSavedFilter, setSavedFilters } from './actions';
import { COLUMN_FILTER_TOGGLE_CLASS } from './constants';
import { TableFilterContext } from './FilterContextProvider';
import { SavedFilterSelect } from './SavedFilterSelect';
import {
  selectFilterValues,
  selectSelectedSavedFilter,
  selectTableSavedFilters,
} from './selectors';
import { TableFilterService } from './TableFilterService';
import { TableProps } from './types';
import { getSavedFiltersKey } from './utils';

const SaveFilterDialog = lazyComponent(() =>
  import('./SaveFilterDialog').then((module) => ({
    default: module.SaveFilterDialog,
  })),
);

const SaveFilterItems = ({ table, formId, apply }) => {
  const dispatch = useDispatch();
  const { openDialog } = useModal();
  const formValues = useSelector(selectFilterValues(table)) || {};

  const selectedSavedFilter = useSelector((state: any) =>
    selectSelectedSavedFilter(state, table),
  );
  const key = useMemo(() => getSavedFiltersKey(table, formId), [table, formId]);

  const list = useSelector((state: any) =>
    selectTableSavedFilters(state, table),
  );

  const saveFilter = useCallback(
    (name, update: boolean) => {
      let newItem;
      const valuesCopy = { ...formValues };
      Object.entries(valuesCopy).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length === 0) {
          delete valuesCopy[key];
        }
      });
      if (update && selectedSavedFilter) {
        // Update
        newItem = {
          ...selectedSavedFilter,
          title: name,
          date: new Date().toISOString(),
          values: valuesCopy,
        };
      } else {
        // New
        const isoDate = new Date().toISOString();
        newItem = {
          id: `${table}-${formId}-${isoDate}`,
          title: name || formatDateTime(null),
          date: isoDate,
          values: valuesCopy,
        };
      }

      TableFilterService.addOrReplace(key, newItem);
      dispatch(setSavedFilters(table, TableFilterService.list(key).reverse()));
      dispatch(selectSavedFilter(table, newItem));
    },
    [key, formValues, selectedSavedFilter, table, formId, dispatch],
  );

  const onSaveFilter = (e, update = false) => {
    openDialog(SaveFilterDialog, {
      resolve: {
        saveFilter,
      },
      size: 'sm',
      initialValues:
        update && selectedSavedFilter
          ? { name: selectedSavedFilter.title }
          : undefined,
    });
    e.stopPropagation();
  };

  const hasFiltersApplied = Object.values(formValues || {}).filter(
    (f) => Boolean(f) || f === false,
  ).length;

  return (
    <>
      {(hasFiltersApplied || selectedSavedFilter) && (
        <div
          className="menu-item"
          data-kt-menu-trigger="click"
          data-kt-menu-placement="right-start"
        >
          <span className="menu-link" aria-hidden="true">
            <span className="menu-title">{translate('Current filters')}</span>
            <CaretRightIcon size={20} className="ms-auto" weight="bold" />
          </span>

          <div className="menu-sub menu-sub-dropdown w-250px py-3 shadow-sm">
            <span
              className="menu-link"
              aria-hidden="true"
              onClick={onSaveFilter}
            >
              <span className="menu-title">{translate('Save as')}</span>
              <StarIcon size={20} className="ms-auto" weight="bold" />
            </span>
            {selectedSavedFilter ? (
              <span
                className="menu-link"
                aria-hidden="true"
                onClick={(e) => onSaveFilter(e, true)}
              >
                {translate('Update')}
                <ArrowsClockwiseIcon
                  size={20}
                  className="ms-auto"
                  weight="bold"
                />
              </span>
            ) : null}
          </div>
        </div>
      )}
      <div
        className="menu-item"
        data-kt-menu-trigger="click"
        data-kt-menu-placement="right-start"
      >
        <span className="menu-link" aria-hidden="true">
          <span className="menu-title">
            {translate('Saved filters ({count})', { count: list.length })}
          </span>
          <CaretRightIcon size={20} className="ms-auto" weight="bold" />
        </span>

        <div className="menu-sub menu-sub-dropdown w-250px py-3 shadow-sm">
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

interface TableFiltersMenuProps extends Pick<
  TableProps,
  | 'filters'
  | 'formId'
  | 'filterPosition'
  | 'filtersStorage'
  | 'setFilter'
  | 'applyFiltersFn'
> {
  table?: TableProps['table'];
  selectedSavedFilter?: TableProps['selectedSavedFilter'];
  openName?: string;
  toggleFilterMenu?(show?): void;
}

export const TableFiltersMenu: FC<TableFiltersMenuProps> = (props) => {
  const context = useContext(TableFilterContext);

  const menuEl = useRef<HTMLDivElement>(null);
  const menuInstance = useRef(null);

  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  // Add show event listener on menu
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

  const apply = useCallback(
    (hideMenu = true) => {
      props.applyFiltersFn(true);
      if (hideMenu) {
        // A small delay is needed for the popup listener to be updated with new filters data and then fired
        setTimeout(() => {
          MenuComponent.hideDropdowns(null);
        }, 100);
      }
      if (props.toggleFilterMenu) props.toggleFilterMenu(true);
    },
    [props.applyFiltersFn, props.toggleFilterMenu],
  );

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
    <TableFilterContext.Provider value={{ ...context, apply }}>
      {props.openName ? (
        <>
          <button
            type="button"
            className={classNames(COLUMN_FILTER_TOGGLE_CLASS, 'text-btn')}
            data-kt-menu-trigger="click"
            data-kt-menu-attach="parent"
            data-kt-menu-placement="bottom"
            data-kt-menu-flip="bottom"
          >
            <FunnelSimpleIcon size={16} weight="bold" />
          </button>
          <div
            ref={menuEl}
            className="table-filters-menu column-filter menu menu-sub menu-sub-dropdown menu-column menu-gray-600 menu-state-bg-gray fw-bold fs-6"
            data-kt-menu="true"
          >
            {props.filters}
          </div>
        </>
      ) : (
        <Tip id="table-add-filter-tip" label={translate('Add filter')}>
          <Button
            variant="secondary"
            size="sm"
            className="btn-icon btn-add-filter"
            data-kt-menu-trigger="click"
            data-kt-menu-attach="parent"
            data-kt-menu-placement="bottom-start"
          >
            <span className="svg-icon svg-icon-4">
              <PlusIcon weight="bold" />
            </span>
          </Button>
          <div
            ref={menuEl}
            className="table-filters-menu menu menu-sub menu-sub-dropdown menu-column menu-gray-700 menu-state-bg-gray fw-bold py-1 fs-6 w-250px"
            data-kt-menu="true"
          >
            <SaveFilterItems
              table={props.table}
              formId={context.form}
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
