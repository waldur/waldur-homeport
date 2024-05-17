import { GearSix } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button, Dropdown, OverlayTrigger, Popover } from 'react-bootstrap';
import SVG from 'react-inlinesvg';

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
                {props.concealedColumns[column.key] ? (
                  <SVG src={CheckboxEmptyIcon} className="me-3" />
                ) : (
                  <SVG src={CheckboxIcon} className="me-3" />
                )}
                {column.title}
              </Dropdown.Item>
            ))}
        </Popover>
      }
      rootClose
    >
      <Button variant="light" className="btn-icon">
        <span className="svg-icon svg-icon-2 svg-icon-dark">
          <GearSix />
        </span>
      </Button>
    </OverlayTrigger>
  );
};
