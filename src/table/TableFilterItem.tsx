import { CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Accordion } from 'react-bootstrap';
import { useFormState } from 'react-final-form';
import { useDebounce } from 'react-use';

import { Badge } from '@/core/Badge';
import { RemoveFilterBadgeButton } from '@/core/RemoveFilterBadgeButton';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { MenuComponent } from '@/metronic/components';

import { TableFilterContext } from './FilterContextProvider';

const DELAY_WAITING_FOR_FILTER = 50; // ms

interface TableFilterItem {
  title: string;
  name?: string;
  badgeValue?(value: any): string | number;
  getValueLabel?(value: any): string | number;
  ellipsis?: boolean;
  showValueBadge?: boolean;
  hideRemoveButton?: boolean;
  onApply?({ title, name, value }): void;
  /** Set to `false` to show "Apply" and "Cancel" buttons */
  instantApply?: boolean;
}

const TableHeaderFilterItem: FC<PropsWithChildren<TableFilterItem>> = ({
  badgeValue = (value) => {
    if (value) {
      if (value instanceof Array) {
        return value.length;
      } else {
        return 1;
      }
    } else return null;
  },
  ...props
}) => {
  const { values } = useFormState({ subscription: { values: true } });
  const [open, setOpen] = React.useState(false);
  const toggleClick = React.useCallback(
    (value, e) => {
      // prevent filter to toggle when clicking on inner clickable elements
      const el = e.target as HTMLElement;
      const isFieldClicked = el.closest('.filter-field');

      if (isFieldClicked) return;
      setOpen(value);
    },
    [setOpen],
  );

  const value = values?.[props.name];

  return (
    <button
      type="button"
      className={classNames('filter-toggle btn btn-sm fw-bold bg-hover-light', {
        active: open,
      })}
      onClick={(event) => toggleClick(!open, event)}
    >
      {props.title}
      {open && <div className="filter-field">{props.children}</div>}
      {!['', undefined].includes(value) ? (
        <div
          className="filter-value"
          style={!props.ellipsis ? { maxWidth: 'unset' } : undefined}
        >
          {badgeValue(value) ? (
            <Badge variant="default" pill outline>
              {badgeValue(value)}
            </Badge>
          ) : null}
        </div>
      ) : null}

      <span className="svg-icon svg-icon-3 rotate-90 ms-2 lh-base">
        <CaretDownIcon size={20} weight="bold" />
      </span>
    </button>
  );
};

export { RemoveFilterBadgeButton };

export const TableSidebarFilterValues = ({
  value,
  getValueLabel,
  badgeValue = null,
  ellipsis = false,
  remove,
  hideRemoveButton = false,
}) => {
  return !['', undefined].includes(value) ? (
    badgeValue ? (
      badgeValue(value) ? (
        <div
          className="filter-value"
          style={!ellipsis ? { maxWidth: 'unset' } : undefined}
        >
          <Badge
            variant="default"
            size="lg"
            rightIcon={
              !hideRemoveButton && (
                <RemoveFilterBadgeButton onClick={() => remove(value, value)} />
              )
            }
            outline
            className="fs-7"
          >
            {badgeValue(value)}
          </Badge>
        </div>
      ) : null
    ) : Array.isArray(value) ? (
      <>
        {value.map((v, i) => (
          <Badge
            key={i}
            variant="default"
            size="lg"
            rightIcon={
              !hideRemoveButton && (
                <RemoveFilterBadgeButton onClick={() => remove(value, v)} />
              )
            }
            outline
            className="filter-value fs-7"
            style={!ellipsis ? { maxWidth: 'unset' } : undefined}
          >
            {getValueLabel(v)}
          </Badge>
        ))}
      </>
    ) : (
      <Badge
        variant="default"
        size="lg"
        rightIcon={
          !hideRemoveButton && (
            <RemoveFilterBadgeButton onClick={() => remove(value, value)} />
          )
        }
        outline
        className="filter-value fs-7"
        style={!ellipsis ? { maxWidth: 'unset' } : undefined}
      >
        {getValueLabel(value)}
      </Badge>
    )
  ) : null;
};

const TableSidebarFilterItem: FC<PropsWithChildren<TableFilterItem>> = ({
  getValueLabel = (value) => {
    if (value) {
      if (Array.isArray(value)) {
        return value.length;
      } else {
        return value?.label || value;
      }
    } else return value;
  },
  ...props
}) => {
  const { setFilter, changeFormField } = React.useContext(TableFilterContext);
  const { values } = useFormState({ subscription: { values: true } });

  const _setFilter = useCallback(
    (value) => {
      setFilter({
        label: props.title,
        name: props.name,
        value: value,
        component: () => (
          <TableSidebarFilterValues
            value={value}
            getValueLabel={getValueLabel}
            badgeValue={props.badgeValue}
            ellipsis={props.ellipsis}
            remove={removeValue}
            hideRemoveButton={props.hideRemoveButton}
          />
        ),
      });
    },
    [props, setFilter],
  );

  const removeValue = useCallback(
    (prevValue, value) => {
      let newValue;
      if (Array.isArray(prevValue) && prevValue.length > 1) {
        newValue = prevValue.filter((v) => !isEqual(v, value));
      } else {
        newValue = null;
      }
      if (changeFormField) {
        changeFormField(props.name, newValue);
      }
      _setFilter(newValue);
    },
    [changeFormField, props.name, _setFilter],
  );

  const itemValue = values?.[props.name];
  useEffect(() => {
    _setFilter(itemValue);
    if (props.onApply)
      props.onApply({ title: props.title, name: props.name, value: itemValue });
  }, [itemValue, _setFilter]);

  return (
    <Accordion.Item eventKey={props.name}>
      <Accordion.Header className="filter-toggle">
        {props.title}
      </Accordion.Header>
      <Accordion.Body>
        <div
          className={classNames('filter-field', props.showValueBadge && 'mb-2')}
        >
          {props.children}
        </div>
        {props.showValueBadge && (
          <TableSidebarFilterValues
            value={itemValue}
            getValueLabel={getValueLabel}
            badgeValue={props.badgeValue}
            ellipsis={props.ellipsis}
            remove={removeValue}
            hideRemoveButton={props.hideRemoveButton}
          />
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

const TableMenuFilterItem: FC<PropsWithChildren<TableFilterItem>> = ({
  getValueLabel = (value) => {
    if (value) {
      if (Array.isArray(value)) {
        return value.length;
      } else {
        return value?.label || value;
      }
    } else return value;
  },
  instantApply = true,
  ...props
}) => {
  const {
    setFilter,
    changeFormField,
    apply,
    columnFilter,
    selectedSavedFilter,
    registerFilterComponent,
  } = React.useContext(TableFilterContext);
  const { values } = useFormState({ subscription: { values: true } });

  const _setFilter = useCallback(
    (value) => {
      setFilter({
        label: props.title,
        name: props.name,
        value: value,
        component: () => (
          <TableSidebarFilterValues
            value={value}
            getValueLabel={getValueLabel}
            badgeValue={props.badgeValue}
            ellipsis={props.ellipsis}
            remove={removeValue}
            hideRemoveButton={props.hideRemoveButton}
          />
        ),
      });
    },
    [props, setFilter],
  );

  // Register the filter renderer to access it from outside (from table cells)
  useEffect(() => {
    registerFilterComponent({
      name: props.name,
      setFilter: _setFilter,
    });
  }, [props.name, _setFilter]);

  const removeValue = useCallback(
    (prevValue, value) => {
      let newValue;
      if (Array.isArray(prevValue) && prevValue.length > 1) {
        newValue = prevValue.filter((v) => !isEqual(v, value));
      } else {
        newValue = null;
      }
      apply(false);
      if (changeFormField) {
        changeFormField(props.name, newValue);
      }
      _setFilter(newValue);
      apply(true);
    },
    [changeFormField, props.name, _setFilter, apply],
  );

  const itemValue = values?.[props.name];

  // The filter field must have an initial value (at least null) so that the filter menu popup does not close when setting this filter for the first time.
  // Wait a moment for the filters to set to the form. Then use them in the table state.
  // Include itemValue in dependencies so filters loaded from URL are reflected in filtersStorage.
  useDebounce(
    () => {
      _setFilter(itemValue);
      if (itemValue === null && changeFormField) {
        changeFormField(props.name, null);
      }
    },
    DELAY_WAITING_FOR_FILTER,
    [itemValue],
  );

  // Update filter when selecting a saved filter
  useEffect(() => {
    if (!selectedSavedFilter?.values) return;
    const value = selectedSavedFilter.values[props.name];
    if (value) {
      _setFilter(value);
    } else {
      removeValue(value, value);
    }
  }, [selectedSavedFilter]);

  const onApply = (hideMenu = true) => {
    _setFilter(itemValue);
    if (props.onApply)
      props.onApply({ title: props.title, name: props.name, value: itemValue });
    apply(hideMenu);
  };

  const [shown, setShown] = useState(false);
  const menuEl = useRef<HTMLDivElement>(null);

  // Use MutationObserver to detect when menu-sub gets 'show' class added/removed
  useEffect(() => {
    if (!menuEl.current) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          const hasShow = menuEl.current?.classList.contains('show') ?? false;
          setShown(hasShow);
        }
      }
    });

    observer.observe(menuEl.current, { attributes: true });

    // Check initial state
    setShown(menuEl.current.classList.contains('show'));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shown && instantApply) {
      // Don't hide menu when value changes (e.g., during typing)
      onApply(false);
    }
  }, [itemValue]);

  return (
    <div
      id={`filter-item-${props.name}`}
      className="menu-item"
      data-kt-menu-trigger="click"
      data-kt-menu-placement={columnFilter ? 'bottom' : 'right-start'}
    >
      <span className="menu-link" aria-hidden="true">
        <span className="menu-title">{props.title}</span>
        <CaretRightIcon size={20} className="ms-auto" weight="bold" />
      </span>

      <div
        ref={menuEl}
        className="menu-sub menu-sub-dropdown w-375px py-3 shadow-sm"
      >
        <div className="menu-item">
          <div
            className="menu-content filter-field"
            onClick={(e) => e.stopPropagation()}
            aria-hidden="true"
          >
            {shown && props.children}
          </div>
        </div>
        {!instantApply && (
          <>
            <div className="separator" />
            <div className="menu-item">
              {shown && (
                <div className="menu-content filter-footer pb-0">
                  <div className="d-flex gap-4">
                    <SubmitButton
                      submitting={false}
                      variant="tertiary"
                      className="flex-grow-1 w-50"
                      onClick={() => MenuComponent.hideDropdowns(null)}
                      type="button"
                      label={translate('Cancel')}
                    />
                    <SubmitButton
                      submitting={false}
                      className="flex-grow-1 w-50"
                      onClick={() => onApply()}
                      type="button"
                      label={translate('Apply')}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/** Please put only one child in each table filter item. */
export const TableFilterItem: FC<PropsWithChildren<TableFilterItem>> = ({
  ellipsis = true,
  ...props
}) => {
  const { filterPosition } = React.useContext(TableFilterContext);
  if (filterPosition === 'menu') {
    return <TableMenuFilterItem ellipsis={ellipsis} {...props} />;
  } else if (filterPosition === 'sidebar') {
    return <TableSidebarFilterItem ellipsis={ellipsis} {...props} />;
  }
  return <TableHeaderFilterItem ellipsis={ellipsis} {...props} />;
};
