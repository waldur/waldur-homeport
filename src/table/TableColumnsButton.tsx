import { GearSix } from '@phosphor-icons/react';
import { FC, useMemo, useState } from 'react';
import { Button, Dropdown, OverlayTrigger, Popover } from 'react-bootstrap';

import { FilterBox } from '@waldur/form/FilterBox';
import { translate } from '@waldur/i18n';

import CheckboxIcon from './Checkbox.svg';
import CheckboxEmptyIcon from './CheckboxEmpty.svg';
import { OPTIONAL_COLUMN_ACTIONS_KEY } from './constants';
import { TableProps } from './Table';

const ColumnsPopover = ({
  columns,
  toggleColumn,
  activeColumns,
  hasActions,
}) => {
  const [query, setQuery] = useState('');

  const matches = useMemo(
    () =>
      columns.filter(
        (column) =>
          !query ||
          typeof column.title !== 'string' ||
          column.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [columns, query],
  );

  return (
    <div className="border mw-400px">
      <div className="p-5">
        <FilterBox
          type="search"
          placeholder={translate('Search') + '...'}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="mh-300px overflow-auto">
        {matches.map((column, index) =>
          column.keys ? (
            <Dropdown.Item
              onClick={() => toggleColumn(index, column)}
              key={index}
            >
              <span className="svg-icon svg-icon-2 svg-icon-white me-3">
                {activeColumns[index] ? (
                  <CheckboxIcon />
                ) : (
                  <CheckboxEmptyIcon />
                )}
              </span>
              {column.title}
            </Dropdown.Item>
          ) : null,
        )}
        {hasActions && (
          <Dropdown.Item
            onClick={() =>
              toggleColumn(OPTIONAL_COLUMN_ACTIONS_KEY, { keys: [] })
            }
          >
            <span className="svg-icon svg-icon-2 svg-icon-white me-3">
              {activeColumns[OPTIONAL_COLUMN_ACTIONS_KEY] ? (
                <CheckboxIcon />
              ) : (
                <CheckboxEmptyIcon />
              )}
            </span>
            {translate('Actions')}
          </Dropdown.Item>
        )}
      </div>
    </div>
  );
};

export const TableColumnButton: FC<TableProps> = ({
  columns,
  activeColumns,
  toggleColumn,
  hoverableRow,
}) => (
  <OverlayTrigger
    trigger="click"
    placement="bottom"
    overlay={
      <Popover id="TableColumnButton">
        <ColumnsPopover
          columns={columns}
          activeColumns={activeColumns}
          toggleColumn={toggleColumn}
          hasActions={Boolean(hoverableRow)}
        />
      </Popover>
    }
    rootClose
  >
    <Button variant="light" className="btn-icon">
      <span className="svg-icon svg-icon-2">
        <GearSix />
      </span>
    </Button>
  </OverlayTrigger>
);
