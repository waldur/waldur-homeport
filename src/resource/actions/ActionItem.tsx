import classNames from 'classnames';
import { uniqueId } from 'lodash';
import { FC, useContext } from 'react';
import { Dropdown } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { ResourceActionMenuContext } from '@waldur/marketplace/resources/actions/ResourceActionMenuContext';

export interface ActionItemProps {
  title: string;
  action: () => void;
  icon?: string;
  staff?: boolean;
  important?: boolean;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  as?;
  iconClass?;
}

export const ActionItem: FC<ActionItemProps> = (props) => {
  const Component = props.as;
  const actionMenuContext = useContext(ResourceActionMenuContext);
  if (
    actionMenuContext?.query &&
    !props.title.includes(actionMenuContext.query)
  ) {
    return null;
  }
  if (actionMenuContext?.hideDisabled && props.disabled) {
    return null;
  }
  if (actionMenuContext?.hideNonImportant && !props.important) {
    return null;
  }
  return Component === Dropdown.Item ? (
    <Component
      className={classNames('d-flex gap-1', props.className)}
      // Workaround for rendering tooltips for disabled dropdown menu items.
      // See also: https://stackoverflow.com/questions/57349166/
      style={props.disabled ? { opacity: 0.3 } : undefined}
      onClick={() => !props.disabled && props.action()}
      as="button"
    >
      {props.tooltip && (
        <Tip label={props.tooltip} id={`action-reason-${uniqueId()}`}>
          <i className="fa fa-question-circle" />
        </Tip>
      )}
      {props.title}
    </Component>
  ) : (
    <Component {...props} />
  );
};

ActionItem.defaultProps = {
  as: Dropdown.Item,
};
