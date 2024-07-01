import { X } from '@phosphor-icons/react';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { FC, PropsWithChildren, useCallback, useEffect } from 'react';
import { Accordion, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Field, change, formValueSelector } from 'redux-form';

import { TableFilterContext } from './TableFilterContainer';

interface TableFilterItem {
  title: string;
  name?: string;
  badgeValue?(value: any): string | number;
  getValueLabel?(value: any): string | number;
  ellipsis?: boolean;
  showValueBadge?: boolean;
  hideRemoveButton?: boolean;
}

const TableHeaderFilterItem: FC<PropsWithChildren<TableFilterItem>> = ({
  badgeValue = (value) => {
    if (value)
      if (value instanceof Array) {
        return value.length;
      } else {
        return 1;
      }
    else return null;
  },
  ...props
}) => {
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
      <Field
        name={props.name}
        component={({ input: { value } }) =>
          !['', undefined].includes(value) ? (
            <div
              className="filter-value"
              style={!props.ellipsis ? { maxWidth: 'unset' } : undefined}
            >
              {badgeValue(value) ? (
                <Badge bg="secondary" className="text-dark">
                  {badgeValue(value)}
                </Badge>
              ) : null}
            </div>
          ) : null
        }
      />
      <span className="svg-icon svg-icon-3 rotate-90 ms-2 lh-base">
        <i className="fa fa-chevron-down" />
      </span>
    </button>
  );
};

export const RemoveFilterBadgeButton = ({ onClick }) => (
  <button
    type="button"
    className="text-btn ps-2 text-hover-danger"
    onClick={onClick}
  >
    <X weight="bold" />
  </button>
);

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
          <Badge bg="secondary" className="text-dark">
            {badgeValue(value)}
            {!hideRemoveButton && (
              <RemoveFilterBadgeButton onClick={() => remove(value, value)} />
            )}
          </Badge>
        </div>
      ) : null
    ) : Array.isArray(value) ? (
      <>
        {value.map((v, i) => (
          <Badge
            key={i}
            bg="secondary"
            className="filter-value text-dark"
            style={!ellipsis ? { maxWidth: 'unset' } : undefined}
          >
            {getValueLabel(v)}
            {!hideRemoveButton && (
              <RemoveFilterBadgeButton onClick={() => remove(value, v)} />
            )}
          </Badge>
        ))}
      </>
    ) : (
      <Badge
        bg="secondary"
        className="filter-value text-dark"
        style={!ellipsis ? { maxWidth: 'unset' } : undefined}
      >
        {getValueLabel(value)}
        {!hideRemoveButton && (
          <RemoveFilterBadgeButton onClick={() => remove(value, value)} />
        )}
      </Badge>
    )
  ) : null;
};

const TableSidebarFilterItem: FC<PropsWithChildren<TableFilterItem>> = ({
  getValueLabel = (value) => {
    if (value)
      if (Array.isArray(value)) {
        return value.length;
      } else {
        return value?.label || value;
      }
    else return value;
  },
  ...props
}) => {
  const { setFilter, form } = React.useContext(TableFilterContext);

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

  const dispatch = useDispatch();
  const removeValue = useCallback(
    (prevValue, value) => {
      let newValue;
      if (Array.isArray(prevValue) && prevValue.length > 1) {
        newValue = prevValue.filter((v) => !isEqual(v, value));
      } else {
        newValue = null;
      }
      dispatch(change(form, props.name, newValue, true));
      _setFilter(newValue);
    },
    [dispatch, form, props.name, _setFilter],
  );

  const itemValue = useSelector((state) =>
    form ? formValueSelector(form)(state, props.name) : null,
  );
  useEffect(() => {
    _setFilter(itemValue);
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
          <Field
            name={props.name}
            component={({ input: { value } }) => (
              <TableSidebarFilterValues
                value={value}
                getValueLabel={getValueLabel}
                badgeValue={props.badgeValue}
                ellipsis={props.ellipsis}
                remove={removeValue}
                hideRemoveButton={props.hideRemoveButton}
              />
            )}
          />
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

/** Please put only one child in each table filter item. */
export const TableFilterItem: FC<PropsWithChildren<TableFilterItem>> = ({
  ellipsis = true,
  ...props
}) => {
  const { filterPosition } = React.useContext(TableFilterContext);
  if (filterPosition === 'sidebar') {
    return <TableSidebarFilterItem ellipsis={ellipsis} {...props} />;
  }
  return <TableHeaderFilterItem ellipsis={ellipsis} {...props} />;
};
