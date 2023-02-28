import classNames from 'classnames';
import { uniqueId } from 'lodash';
import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

interface ActionItemProps {
  title: string;
  action: () => void;
  icon?: string;
  staff?: boolean;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  as?;
  iconClass?;
}

export const ActionItem: FC<ActionItemProps> = (props) => {
  const Component = props.as;
  return Component === Dropdown.Item ? (
    <Component
      className={classNames('d-flex gap-1', props.className)}
      // Workaround for rendering tooltips for disabled dropdown menu items.
      // See also: https://stackoverflow.com/questions/57349166/
      style={props.disabled ? { opacity: 0.3 } : undefined}
      onClick={() => !props.disabled && props.action()}
    >
      {props.tooltip && (
        <Tip label={props.tooltip} id={`action-reason-${uniqueId()}`}>
          <i className="fa fa-question-circle" />
        </Tip>
      )}
      {props.title}
      {props.staff && (
        <Tip
          label={translate('Staff action')}
          id={`staff-action-${uniqueId()}`}
          className="ms-auto ps-2"
        >
          <i className="fa fa-user" />
        </Tip>
      )}
    </Component>
  ) : (
    <Component {...props} />
  );
};

ActionItem.defaultProps = {
  as: Dropdown.Item,
};
