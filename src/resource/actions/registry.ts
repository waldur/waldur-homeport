import { ActionItemType } from './types';
import { UnlinkActionItem } from './UnlinkActionItem';

class ActionConfiguration {
  private actions: Record<string, ActionItemType[]> = {};
  private quickActions: Record<string, ActionItemType[]> = {};

  register(type, config: any) {
    this.actions[type] = config;
  }

  registerQuickActions(type, config: any) {
    this.quickActions[type] = config;
  }

  getActions(type) {
    return [...(this.actions[type] || []), UnlinkActionItem];
  }

  getQuickActions(type) {
    return this.quickActions[type] || [];
  }
}

export const ActionRegistry = new ActionConfiguration();
