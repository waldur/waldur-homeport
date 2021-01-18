class ActionConfiguration {
  private resources = {};

  register(type, config: any) {
    this.resources[type] = config;
  }

  getActions(type) {
    return this.resources[type];
  }
}

export const ActionRegistry = new ActionConfiguration();
