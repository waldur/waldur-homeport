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
  loading?: boolean;
  error?: object;
  actions: object;
}

const getButtonClass = action => ({
  disabled: !action.enabled || action.pending,
  remove: action.destructive,
});

export const ResourceActionComponent = (props: ResourceActionComponentProps) => (
  <DropdownButton
    title={translate('Actions')}
    id="actions-dropdown-btn"
    className={props.disabled ? 'disabled' : ''}
    onToggle={props.onToggle}
  >
    {props.loading ? (
      <MenuItem eventKey="1">{translate('Loading actions')}</MenuItem>
    ) : props.error ? (
      <MenuItem eventKey="1">{translate('Unable to load actions')}</MenuItem>
    ) : Object.keys(props.actions).length === 0 ? (
      <MenuItem eventKey="2">{translate('There are no actions.')}</MenuItem>
    ) : (
      Object.keys(props.actions).map(key => (
        <MenuItem
          key={key}
          eventKey={key}
          className={classNames(getButtonClass(props.actions[key]))}
          onSelect={() => props.onSelect(key, props.actions[key])}
        >
          {props.actions[key].reason ?
            <>
              <Tooltip key={key} label={props.actions[key].reason} id="action-reason">
                <i className="fa fa-question-circle"/>
              </Tooltip>
              {' '}
              {props.actions[key].title}
            </> : props.actions[key].title
          }
        </MenuItem>
      ))
    )}
  </DropdownButton>
);
