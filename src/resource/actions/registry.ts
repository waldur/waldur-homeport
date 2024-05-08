import { ActionItemType } from './types';
import { UnlinkActionItem } from './UnlinkActionItem';

class ActionConfiguration {
  private actions: Record<string, ActionItemType[]> = {};

  register(type, config: any) {
    this.actions[type] = config;
  }

  getActions(type) {
    return [...(this.actions[type] || []), UnlinkActionItem];
  }
}

export const ActionRegistry = new ActionConfiguration();
