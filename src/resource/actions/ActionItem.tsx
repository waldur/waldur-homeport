import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import { FC, ReactNode, useContext } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';

import { Tip } from '@/core/Tooltip';
import { StaffOnlyIndicator } from '@/customer/details/StaffOnlyIndicator';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { ResourceActionMenuContext } from '@/marketplace/resources/actions/ResourceActionMenuContext';
import { ActionButton } from '@/table/ActionButton';
import { CompactActionButton } from '@/table/CompactActionButton';

export interface ActionItemProps {
  title: string;
  action: () => void;
  iconNode?: ReactNode;
  iconColor?: Variant;
  staff?: boolean;
  important?: boolean;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  as?;
  size?: 'sm' | 'lg';
  actionId?: ResourceAction;
  resource?: any;
  variant?: string;
}

export const ActionItem: FC<ActionItemProps> = (props) => {
  const Component = props.as || Dropdown.Item;
  const actionMenuContext = useContext(ResourceActionMenuContext);
  if (
    props.actionId &&
    props.resource?.offering_plugin_options?.disabled_resource_actions?.includes(
      props.actionId,
    )
  ) {
    return null;
  }
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

  // When rendering as a Button (or any non-Dropdown.Item), use ActionButton or CompactActionButton
  if (props.as && Component !== Dropdown.Item) {
    const ButtonComponent =
      props.size === 'sm' ? CompactActionButton : ActionButton;
    return (
      <div className="d-flex align-items-center">
        <ButtonComponent
          className={props.className}
          action={props.action}
          disabled={props.disabled}
          iconNode={props.iconNode}
          title={props.title}
          tooltip={props.tooltip}
          variant={props.variant}
        />
        {props.staff && <StaffOnlyIndicator className="text-dark ms-1 me-3" />}
      </div>
    );
  }

  return Component === Dropdown.Item ? (
    <div className="d-flex align-items-center">
      <Component
        className={classNames(
          'd-flex gap-3',
          props.className,
          props.disabled && 'bg-hover-lighten',
        )}
        // Workaround for rendering tooltips for disabled dropdown menu items.
        // See also: https://stackoverflow.com/questions/57349166/
        onClick={(event) => {
          if (props.disabled) {
            return;
          }

          props.action();

          // Fix: Dropdown toggle may stay focused after pointer selection,
          // making button state look stuck until next click.
          if (event.detail > 0) {
            requestAnimationFrame(() => {
              const activeElement = document.activeElement;
              if (activeElement instanceof HTMLElement) {
                activeElement.blur();
              }
            });
          }
        }}
        disabled={props.disabled}
      >
        <div className={props.disabled ? 'opacity-50' : undefined}>
          {props.iconNode && (
            <span
              className={classNames(
                'svg-icon svg-icon-2',
                `svg-icon-${props.iconColor || 'gray-400'}`,
              )}
            >
              {props.iconNode}
            </span>
          )}
          {props.title}
        </div>
      </Component>
      {props.tooltip && (
        <Tip
          label={props.tooltip}
          id={`action-reason-${uniqueId()}`}
          className="ms-1 me-3"
        >
          <QuestionIcon
            size={20}
            weight="bold"
            className={classNames('text-muted', props.disabled && 'opacity-50')}
          />
        </Tip>
      )}
      {props.staff && <StaffOnlyIndicator className="text-dark ms-1 me-3" />}
    </div>
  ) : (
    <Component {...props} />
  );
};
