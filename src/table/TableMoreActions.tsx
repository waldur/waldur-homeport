import { FunctionComponent, useEffect } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';

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
    <div className="ms-3">
      <Button
        variant="primary"
        className="rotate"
        data-kt-menu-trigger="click"
        data-kt-menu-placement="bottom-end"
        data-kt-menu-attach="parent"
      >
        {translate('More actions')}
        <span className="svg-icon svg-icon-3 rotate-180 ms-3 me-0">
          <i className="fa fa-chevron-down p-0" />
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
                  {item.icon && (
                    <span className="menu-icon">
                      <i className={item.icon} />
                    </span>
                  )}
                  <span className="menu-title">{item.label}</span>
                  <span className="menu-arrow"></span>
                </a>
                <div className="menu-sub menu-sub-dropdown w-175px py-3">
                  {item.children.map((child, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="menu-item px-3"
                      data-kt-menu-trigger
                    >
                      <a onClick={child.action} className="menu-link px-3">
                        {child.icon && (
                          <span className="menu-icon">
                            <i className={child.icon} />
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
                <a onClick={item.action} className="menu-link px-3">
                  {item.icon && (
                    <span className="menu-icon">
                      <i className={item.icon} />
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
