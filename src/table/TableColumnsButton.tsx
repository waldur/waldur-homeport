import { GearSix } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button, Dropdown, OverlayTrigger, Popover } from 'react-bootstrap';

import CheckboxIcon from './Checkbox.svg';
import CheckboxEmptyIcon from './CheckboxEmpty.svg';
import { TableProps } from './Table';

export const TableColumnButton: FC<TableProps> = (props) => {
  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      overlay={
        <Popover>
          {props.columns
            .filter((column) => column.key)
            .map((column, index) => (
              <Dropdown.Item
                onClick={() => props.toggleColumn(column)}
                key={index}
              >
                <span className="svg-icon svg-icon-2 svg-icon-white me-3">
                  {props.concealedColumns[column.key] ? (
                    <CheckboxEmptyIcon />
                  ) : (
                    <CheckboxIcon />
                  )}
                </span>
                {column.title}
              </Dropdown.Item>
            ))}
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
};
