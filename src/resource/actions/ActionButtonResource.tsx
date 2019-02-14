import * as classNames from 'classnames';
import * as React from 'react';
import * as DropdownButton from 'react-bootstrap/lib/DropdownButton';
import * as MenuItem from 'react-bootstrap/lib/MenuItem';

import { ngInjector } from '@waldur/core/services';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';

import './ActionButtonResource.scss';

interface ActionButtonResourceProps {
  row: Resource;
}

export class ActionButtonResource extends React.Component<ActionButtonResourceProps> {
  state = {
    loading: false,
    actions: {},
  };

  formatResource = (row: Resource) => ({
    ...row,
    url: row.scope,
    ...row.attributes,
  })

  getActions = () => {
    this.setState({loading: true});
    ngInjector.get('actionUtilsService')
      .loadActions(this.formatResource(this.props.row))
      .then(actions => {
        const actionsObj = {};
        for (const key in actions) {
          if (!actions[key].tab) {
            actionsObj[key] = actions[key];
          }
        }
        this.setState({loading: false, actions: actionsObj});
      });
  }

  openDropdown = (isOpen: boolean) => {
    if (isOpen) {
      this.getActions();
    }
  }

  triggerAction = (name: string, action: object) => {
    const controller = {
      handleActionException: () => undefined,
      reInitResource: () => undefined,
    };
    return ngInjector.get('actionUtilsService')
      .buttonClick(controller, this.formatResource(this.props.row), name, action);
  }

  buttonClass(action) {
    return {
      disabled: !action.enabled || action.pending,
      remove: action.destructive,
    };
  }

  render() {
    const state = this.state;
    return (
      <DropdownButton
        title={translate('Actions')}
        id="actions-dropdown-btn"
        onToggle={this.openDropdown}
      >
        {state.loading && <MenuItem eventKey="1">{translate('Loading actions')}</MenuItem>}

        {!state.loading && Object.keys(state.actions).length === 0 &&
          <MenuItem eventKey="2">{translate('There are no actions.')}</MenuItem>
        }

        {Object.keys(state.actions).map(key => (
          <MenuItem
            key={key}
            eventKey={key}
            className={classNames(this.buttonClass(state.actions[key]))}
            onSelect={() => this.triggerAction(key, state.actions[key])}
          >
            {state.actions[key].reason ?
              <>
                <Tooltip key={key} label={state.actions[key].reason} id="action-reason">
                  <i className="fa fa-question-circle"/>
                </Tooltip>
                {' '}
                {state.actions[key].title}
              </> : state.actions[key].title
            }
          </MenuItem>
        ))}
      </DropdownButton>
    );
  }
}
