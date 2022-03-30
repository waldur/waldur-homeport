import { uniqueId } from 'lodash';
import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

interface ActionItemProps {
  title: string;
  action: () => void;
  icon?: string;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

export const ActionItem: FC<ActionItemProps> = (props) => (
  <Dropdown.Item
    className={props.className}
    // Workaround for rendering tooltips for disabled dropdown menu items.
    // See also: https://stackoverflow.com/questions/57349166/
    style={props.disabled ? { opacity: 0.3 } : undefined}
    onSelect={() => !props.disabled && props.action()}
  >
    {props.tooltip ? (
      <>
        <Tip label={props.tooltip} id={`action-reason-${uniqueId()}`}>
          <i className="fa fa-question-circle" />
        </Tip>{' '}
        {props.title}
      </>
    ) : (
      props.title
    )}
  </Dropdown.Item>
);
