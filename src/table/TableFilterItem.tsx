import classNames from 'classnames';
import React from 'react';
import { Badge } from 'react-bootstrap';

interface TableFilterItem {
  title: string;
  name?: string;
  value?: Object;
  badgeValue?(value: any): string | number;
  customValueComponent?: React.ComponentType<{ value: any }>;
  ellipsis?: boolean;
}

/** Please put only one child in each table filter item. */
export const TableFilterItem: React.FunctionComponent<TableFilterItem> = (
  props,
) => {
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
      <div className="filter-field">{props.children}</div>
      {props.value && (
        <div
          className="filter-value"
          style={!props.ellipsis ? { maxWidth: 'unset' } : undefined}
        >
          {props.customValueComponent ? (
            React.createElement(props.customValueComponent, {
              value: props.value,
            })
          ) : (
            <Badge bg="secondary" className="text-dark">
              {props.badgeValue(props.value)}
            </Badge>
          )}
        </div>
      )}
      <span className="svg-icon svg-icon-3 rotate-90 ms-2 lh-base">
        <i className="fa fa-chevron-down" />
      </span>
    </button>
  );
};

TableFilterItem.defaultProps = {
  badgeValue: (value) => {
    if (value)
      if (value instanceof Array) {
        return value.length;
      } else {
        return 1;
      }
    else return null;
  },
  ellipsis: true,
};
