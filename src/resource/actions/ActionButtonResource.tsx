import * as React from 'react';

import { ngInjector, $http } from '@waldur/core/services';

import './ActionButtonResource.scss';
import { ResourceActionComponent } from './ResourceActionComponent';

interface ActionButtonResourceProps {
  url: string;
  disabled?: boolean;
}

async function loadActions(url) {
  const response = await $http.get(url);
  const resource = response.data;
  const actionUtilsService = ngInjector.get('actionUtilsService');
  const rawActions = await actionUtilsService.loadActions(resource);
  const actions = {};
  for (const key in rawActions) {
    if (!rawActions[key].tab) {
      actions[key] = rawActions[key];
    }
  }
  return {resource, actions};
}

export class ActionButtonResource extends React.Component<ActionButtonResourceProps> {
  state = {
    loading: false,
    error: undefined,
    actions: {},
    resource: undefined,
  };

  getActions = async () => {
    this.setState({loading: true});
    try {
      const {resource, actions} = await loadActions(this.props.url);
      this.setState({
        loading: false,
        resource,
        actions,
      });
    } catch (error) {
      this.setState({
        loading: false,
        error,
      });
    }
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
      .buttonClick(controller, this.state.resource, name, action);
  }

  render() {
    return (
      <ResourceActionComponent
        disabled={this.props.disabled}
        loading={this.state.loading}
        error={this.state.error}
        actions={this.state.actions}
        onToggle={this.openDropdown}
        onSelect={this.triggerAction}
      />
    );
  }
}
