import uniqueId from 'lodash.uniqueid';
import { FC } from 'react';
import { MenuItem } from 'react-bootstrap';

import { Tooltip } from '@waldur/core/Tooltip';

interface ActionItemProps {
  title: string;
  action: () => void;
  icon?: string;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

export const ActionItem: FC<ActionItemProps> = (props) => (
  <MenuItem
    className={props.className}
    // Workaround for rendering tooltips for disabled dropdown menu items.
    // See also: https://stackoverflow.com/questions/57349166/
    style={props.disabled ? { opacity: 0.3 } : undefined}
    onSelect={() => !props.disabled && props.action()}
  >
    {props.tooltip ? (
      <>
        <Tooltip label={props.tooltip} id={`action-reason-${uniqueId()}`}>
          <i className="fa fa-question-circle" />
        </Tooltip>{' '}
        {props.title}
      </>
    ) : (
      props.title
    )}
  </MenuItem>
);
