import * as React from 'react';

import { ngInjector } from '@waldur/core/services';
import { Resource } from '@waldur/marketplace/resources/types';

import './ActionButtonResource.scss';
import { ResourceActionComponent } from './ResourceActionComponent';

interface ActionButtonResourceProps {
  row: Resource;
  disabled?: boolean;
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

  render() {
    return (
      <ResourceActionComponent
        disabled={this.props.disabled}
        loading={this.state.loading}
        actions={this.state.actions}
        onToggle={this.openDropdown}
        onSelect={this.triggerAction}
      />
    );
  }
}
