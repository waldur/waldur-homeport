import { ComponentType } from 'react';

class ActionConfiguration {
  private resources: Record<
    string,
    ComponentType<{ resource; reInitResource }>[]
  > = {};

  register(type, config: any) {
    this.resources[type] = config;
  }

  getActions(type) {
    return this.resources[type];
  }
}

export const ActionRegistry = new ActionConfiguration();
