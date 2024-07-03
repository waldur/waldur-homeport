import { Question } from '@phosphor-icons/react';
import classNames from 'classnames';
import { uniqueId } from 'lodash';
import { FC, ReactNode, useContext } from 'react';
import { Button, Dropdown } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { ResourceActionMenuContext } from '@waldur/marketplace/resources/actions/ResourceActionMenuContext';

export interface ActionItemProps {
  title: string;
  action: () => void;
  icon?: string;
  iconNode?: ReactNode;
  staff?: boolean;
  important?: boolean;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  as?;
}

export const ActionItem: FC<ActionItemProps> = (props) => {
  const Component = props.as || Dropdown.Item;
  const actionMenuContext = useContext(ResourceActionMenuContext);
  if (
    actionMenuContext?.query &&
    !props.title
      .toLocaleLowerCase()
      .includes(actionMenuContext.query.toLocaleLowerCase())
  ) {
    return null;
  }
  if (actionMenuContext?.hideDisabled && props.disabled) {
    return null;
  }
  if (actionMenuContext?.hideNonImportant && !props.important) {
    return null;
  }
  return Component === Dropdown.Item || Component === Button ? (
    <Component
      className={classNames('d-flex gap-1', props.className)}
      // Workaround for rendering tooltips for disabled dropdown menu items.
      // See also: https://stackoverflow.com/questions/57349166/
      style={props.disabled ? { opacity: 0.3 } : undefined}
      onClick={() => !props.disabled && props.action()}
      as="button"
      variant={Component === Button ? '' : undefined}
    >
      {props.tooltip && (
        <Tip label={props.tooltip} id={`action-reason-${uniqueId()}`}>
          <Question />
        </Tip>
      )}
      {props.iconNode && (
        <span className="svg-icon svg-icon-2">{props.iconNode}</span>
      )}
      {props.title}
    </Component>
  ) : (
    <Component {...props} />
  );
};
