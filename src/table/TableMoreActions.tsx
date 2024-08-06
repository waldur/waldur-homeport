/* eslint-disable jsx-a11y/anchor-is-valid */
import { DotsThreeVertical } from '@phosphor-icons/react';
import { FunctionComponent, useEffect } from 'react';
import { Button } from 'react-bootstrap';

import { MenuComponent } from '@waldur/metronic/components';

import { TableDropdownItem } from './types';

interface TableMoreActionsProps {
  actions?: TableDropdownItem[];
}

export const TableMoreActions: FunctionComponent<TableMoreActionsProps> = ({
  actions,
}) => {
  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  return (
    <div className="ms-auto">
      <Button
        variant="active-light-primary"
        className="btn-icon btn-text-grey-500 no-arrow"
        data-kt-menu-trigger="click"
        data-kt-menu-placement="bottom-end"
        data-kt-menu-attach="parent"
      >
        <span className="svg-icon svg-icon-1">
          <DotsThreeVertical weight="bold" />
        </span>
      </Button>

      <div
        id="table-actions"
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold py-3 w-200px"
        data-kt-menu="true"
      >
        {actions &&
          actions?.map((item, i) =>
            item.children && item.children.length ? (
              <div
                key={i}
                className="menu-item px-3"
                data-kt-menu-trigger="hover"
                data-kt-menu-placement="left-start"
              >
                <a className="menu-link px-3">
                  {item.iconNode && (
                    <span className="menu-icon svg-icon svg-icon-2 text-dark">
                      {item.iconNode}
                    </span>
                  )}
                  <span className="menu-title">{item.label}</span>
                  <span className="menu-arrow" />
                </a>
                <div className="menu-sub menu-sub-dropdown w-175px py-3">
                  {item.children.map((child, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="menu-item px-3"
                      data-kt-menu-trigger
                    >
                      <a
                        onClick={child.action}
                        className="menu-link px-3"
                        aria-hidden="true"
                      >
                        {item.iconNode && (
                          <span className="menu-icon svg-icon svg-icon-2 text-dark">
                            {item.iconNode}
                          </span>
                        )}
                        {child.label}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div key={i} className="menu-item px-3" data-kt-menu-trigger>
                <a
                  onClick={item.action}
                  className="menu-link px-3"
                  aria-hidden="true"
                >
                  {item.iconNode && (
                    <span className="menu-icon svg-icon svg-icon-2 text-dark">
                      {item.iconNode}
                    </span>
                  )}
                  {item.label}
                </a>
              </div>
            ),
          )}
      </div>
    </div>
  );
};
