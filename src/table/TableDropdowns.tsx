import { FunctionComponent, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import ExportDropdown from '@waldur/table/ExportDropdown';

import './TableDropdowns.scss';

export const TableDropdowns: FunctionComponent<any> = (props) => {
  const [openExport, setOpenExport] = useState(false);
  const { exportAs, actions } = props;
  const { theme } = useSelector((state: RootState) => state.theme);
  return (
    <>
      <Dropdown
        id="table-dropdown-actions"
        onToggle={() => setOpenExport(false)}
        className="table_dropdown menu-gray-800 menu-state-bg-light-primary"
      >
        <Dropdown.Toggle
          variant="transparent"
          bsPrefix="p-0"
          className="btn-icon btn-color-primary btn-active-light-primary me-3"
        >
          <span className="svg-icon svg-icon-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
            >
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <rect
                  x="5"
                  y="5"
                  width="5"
                  height="5"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  x="14"
                  y="5"
                  width="5"
                  height="5"
                  rx="1"
                  fill="currentColor"
                  opacity="0.3"
                />
                <rect
                  x="5"
                  y="14"
                  width="5"
                  height="5"
                  rx="1"
                  fill="currentColor"
                  opacity="0.3"
                />
                <rect
                  x="14"
                  y="14"
                  width="5"
                  height="5"
                  rx="1"
                  fill="currentColor"
                  opacity="0.3"
                />
              </g>
            </svg>
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu
          align="end"
          variant="light"
          className="table_dropdown_menu shadow-sm menu-gray-800 menu-state-bg-light-primary px-3"
        >
          {actions?.map((item) =>
            item.label === translate('Export') ? (
              <Dropdown.Item
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenExport(!openExport);
                }}
                key={item.label}
                role="menuitem"
                tabIndex={-1}
                className={`export_button ${theme}`}
              >
                <ExportDropdown exportAs={exportAs} />
              </Dropdown.Item>
            ) : item.label === translate('Refresh') ? (
              <Dropdown.Item
                key={item.label}
                onClick={props.fetch}
                role="menuitem"
                tabIndex={-1}
                className="cursor-pointer"
              >
                <i className="fa fa-refresh" />
                &nbsp;{translate('Refresh')}
              </Dropdown.Item>
            ) : (
              <Dropdown.Item
                onClick={item.handler}
                key={item.label}
                role="menuitem"
                tabIndex={-1}
                className="cursor-pointer"
              >
                <i className={item.icon} /> {item.label}
              </Dropdown.Item>
            ),
          )}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};
