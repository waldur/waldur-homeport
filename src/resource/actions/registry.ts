import { ActionItem } from './types';
import { UnlinkActionItem } from './UnlinkActionItem';

class ActionConfiguration {
  private resources: Record<string, ActionItem[]> = {};

  register(type, config: any) {
    this.resources[type] = config;
  }

  getActions(type) {
    return [...this.resources[type], UnlinkActionItem];
  }
}

export const ActionRegistry = new ActionConfiguration();
