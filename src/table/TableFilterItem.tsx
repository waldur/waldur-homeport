import { CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import * as RadixPopover from '@radix-ui/react-popover';
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
import { useSelector } from 'react-redux';
import { useDebounce } from 'react-use';

import { Badge } from '@/core/Badge';
import { RemoveFilterBadgeButton } from '@/core/RemoveFilterBadgeButton';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';

import { TableFilterContext } from './FilterContextProvider';
import { selectFilterValues } from './selectors';

const DELAY_WAITING_FOR_FILTER = 50; // ms

export interface TableFilterItemProps {
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

const TableHeaderFilterItem: FC<PropsWithChildren<TableFilterItemProps>> = ({
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
  const { table } = React.useContext(TableFilterContext);
  const values = useSelector(selectFilterValues(table));
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

const TableSidebarFilterItem: FC<PropsWithChildren<TableFilterItemProps>> = ({
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
  const { table, setFilter, changeFilterValue } =
    React.useContext(TableFilterContext);
  const values = useSelector(selectFilterValues(table));

  const _setFilterRef = useRef<any>();

  const removeValue = useCallback(
    (prevValue, value) => {
      let newValue;
      if (Array.isArray(prevValue) && prevValue.length > 1) {
        newValue = prevValue.filter((v) => !isEqual(v, value));
      } else {
        newValue = null;
      }
      if (changeFilterValue) {
        changeFilterValue(props.name, newValue);
      }
      if (_setFilterRef.current) {
        _setFilterRef.current(newValue);
      }
    },
    [changeFilterValue, props.name],
  );

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
    [
      props.title,
      props.name,
      getValueLabel,
      props.badgeValue,
      props.ellipsis,
      removeValue,
      props.hideRemoveButton,
      setFilter,
    ],
  );
  _setFilterRef.current = _setFilter;

  const itemValue = values?.[props.name];
  useDebounce(
    () => {
      _setFilter(itemValue);
      if (props.onApply)
        props.onApply({
          title: props.title,
          name: props.name,
          value: itemValue,
        });
    },
    DELAY_WAITING_FOR_FILTER,
    [itemValue],
  );

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

const TableMenuFilterItem: FC<PropsWithChildren<TableFilterItemProps>> = ({
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
    table,
    setFilter,
    changeFilterValue,
    apply,
    selectedSavedFilter,
    registerFilterComponent,
    openMenuName,
    menuIsOpen,
    closeMenu,
  } = React.useContext(TableFilterContext);
  const values = useSelector(selectFilterValues(table));

  const _setFilterRef = useRef<any>();

  const removeValue = useCallback(
    (prevValue, value) => {
      let newValue;
      if (Array.isArray(prevValue) && prevValue.length > 1) {
        newValue = prevValue.filter((v) => !isEqual(v, value));
      } else {
        newValue = null;
      }
      apply(false);
      if (changeFilterValue) {
        changeFilterValue(props.name, newValue);
      }
      if (_setFilterRef.current) {
        _setFilterRef.current(newValue);
      }
      apply(true);
    },
    [changeFilterValue, props.name, apply],
  );

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
    [
      props.title,
      props.name,
      getValueLabel,
      props.badgeValue,
      props.ellipsis,
      removeValue,
      props.hideRemoveButton,
      setFilter,
    ],
  );
  _setFilterRef.current = _setFilter;

  // Register the filter renderer to access it from outside (from table cells)
  useEffect(() => {
    registerFilterComponent({
      name: props.name,
      setFilter: _setFilter,
    });
  }, [props.name, _setFilter]);

  const itemValue = values?.[props.name];

  // The filter field must have an initial value (at least null) so that the filter menu popup does not close when setting this filter for the first time.
  // Wait a moment for the filters to set to the form. Then use them in the table state.
  // Include itemValue in dependencies so filters loaded from URL are reflected in filtersStorage.
  useDebounce(
    () => {
      _setFilter(itemValue);
      if (itemValue === null && changeFilterValue) {
        changeFilterValue(props.name, null);
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

  const [open, setOpen] = useState(false);

  // The column-header funnel icon (TableFiltersMenu.tsx's `openName`
  // branch) targets exactly one filter — its whole point is "this
  // column's own control," not the full filter list — so that one row
  // renders its field directly below, with no collapsed menu-link/nested
  // Popover of its own, and every *other* row renders nothing at all
  // rather than showing a redundant full list alongside it (reported
  // live: the column icon opened the entire "Add filter"-style list,
  // with the target's own flyout then overlapping it — "dropdown menu is
  // not needed in this case").
  const isColumnMode = Boolean(openMenuName);
  const isColumnTarget = isColumnMode && openMenuName === props.name;

  // Previously this effect only ever needed `open` as its guard: the
  // "Add filter" list's own row starts `open === false`, so the effect
  // is inert until the user actually clicks to expand it — mount-time
  // firing was never possible. The column-target row breaks that: it's
  // "open" (visible) from the very first render, no click required, so
  // without a separate guard this fired instantApply's onApply() — a
  // real applyFiltersFn()/setFilter() dispatch — during the initial
  // mount of *every* filterable column at once, well before the user
  // touched anything. That flood of synchronous cross-component
  // dispatches, all firing while React was still mid-mount for sibling
  // columns, is what reproduced a live "Should not already be working"
  // React invariant violation in Storybook (not caught by the jsdom
  // suite, which never exercises more than one filterable column
  // mounting at once). `skipFirstRun` suppresses exactly the mount-time
  // call — real, later value changes are unaffected.
  const skipFirstRun = useRef(true);
  useEffect(() => {
    if (skipFirstRun.current) {
      skipFirstRun.current = false;
      return;
    }
    if ((open || (isColumnTarget && menuIsOpen)) && instantApply) {
      // Don't hide menu when value changes (e.g., during typing)
      onApply(false);
    }
  }, [itemValue]);

  if (isColumnMode && !isColumnTarget) {
    return null;
  }

  if (isColumnTarget) {
    return (
      <div id={`filter-item-${props.name}`} className="menu-item">
        <div
          className="menu-content filter-field"
          onClick={(e) => e.stopPropagation()}
          aria-hidden="true"
        >
          {/* Deferred until the popup itself is open, not mounted the
              moment this force-mounted row exists — see menuIsOpen's own
              comment in FilterContextProvider.tsx: mounting react-select
              (or similar) immediately, for every filterable column at
              once on page load, let its own auto-focus-on-mount behavior
              fire simultaneously across all of them. */}
          {menuIsOpen && props.children}
        </div>
        {!instantApply && menuIsOpen && (
          <>
            <div className="separator" />
            <div className="menu-item">
              <div className="menu-content filter-footer pb-0">
                <div className="d-flex gap-4">
                  <SubmitButton
                    submitting={false}
                    variant="tertiary"
                    className="flex-grow-1 w-50"
                    onClick={closeMenu}
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
            </div>
          </>
        )}
      </div>
    );
  }

  // The "Add filter" list (openMenuName undefined): unchanged
  // accordion-row shape — click to expand this one row's own nested
  // Popover, coexisting with every other row in the same list.
  return (
    <div id={`filter-item-${props.name}`} className="menu-item">
      <RadixPopover.Root open={open} onOpenChange={setOpen} modal={false}>
        <RadixPopover.Trigger asChild>
          <span className="menu-link" role="button">
            <span className="menu-title">{props.title}</span>
            <CaretRightIcon size={20} className="ms-auto" weight="bold" />
          </span>
        </RadixPopover.Trigger>
        <RadixPopover.Portal>
          <RadixPopover.Content
            side="right"
            align="start"
            sideOffset={2}
            data-popper-placement="right-start"
            className="menu-sub menu-sub-dropdown show w-375px py-3 shadow-sm"
          >
            <div className="menu-item">
              <div
                className="menu-content filter-field"
                onClick={(e) => e.stopPropagation()}
                aria-hidden="true"
              >
                {open && props.children}
              </div>
            </div>
            {!instantApply && (
              <>
                <div className="separator" />
                <div className="menu-item">
                  {open && (
                    <div className="menu-content filter-footer pb-0">
                      <div className="d-flex gap-4">
                        <SubmitButton
                          submitting={false}
                          variant="tertiary"
                          className="flex-grow-1 w-50"
                          onClick={() => setOpen(false)}
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
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    </div>
  );
};

/** Please put only one child in each table filter item. */
export const TableFilterItem: FC<PropsWithChildren<TableFilterItemProps>> = ({
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
