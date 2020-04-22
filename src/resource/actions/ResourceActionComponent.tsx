import * as classNames from 'classnames';
import * as React from 'react';
import * as DropdownButton from 'react-bootstrap/lib/DropdownButton';
import * as MenuItem from 'react-bootstrap/lib/MenuItem';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

interface ResourceActionComponentProps {
  onToggle: (isOpen: boolean) => void;
  onSelect: (name: string, action: object) => void;
  disabled?: boolean;
  open?: boolean;
  loading?: boolean;
  error?: object;
  actions: object;
}

const ActionItem = ({ action, key, onSelect }) => (
  <MenuItem
    eventKey={key}
    className={classNames({
      remove: action.destructive,
    })}
    disabled={!action.enabled || action.pending}
    onSelect={() => onSelect(key, action)}
  >
    {action.reason ? (
      <>
        <Tooltip key={key} label={action.reason} id={`action-reason-${key}`}>
          <i className="fa fa-question-circle" />
        </Tooltip>{' '}
        {action.title}
      </>
    ) : (
      action.title
    )}
  </MenuItem>
);

export const ResourceActionComponent = (
  props: ResourceActionComponentProps,
) => (
  <DropdownButton
    title={translate('Actions')}
    id="actions-dropdown-btn"
    onToggle={props.onToggle}
    open={props.open}
    disabled={props.disabled}
  >
    {props.open ? (
      props.loading ? (
        <MenuItem eventKey="1">{translate('Loading actions')}</MenuItem>
      ) : props.error ? (
        <MenuItem eventKey="1">{translate('Unable to load actions')}</MenuItem>
      ) : props.actions ? (
        Object.keys(props.actions).length === 0 ? (
          <MenuItem eventKey="2">{translate('There are no actions.')}</MenuItem>
        ) : (
          Object.keys(props.actions).map(key => (
            <ActionItem
              key={key}
              action={props.actions[key]}
              onSelect={props.onSelect}
            />
          ))
        )
      ) : null
    ) : null}
  </DropdownButton>
);
