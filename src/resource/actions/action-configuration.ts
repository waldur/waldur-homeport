class ActionConfiguration {
  private resources = {};

  register(type, config) {
    this.resources[type] = config;
    if (config.options) {
      Object.keys(config.options).forEach(name => {
        config.options[name].name = name;
      });
    }
  }

  getActions(type) {
    return this.resources[type];
  }
}

export const ActionConfigurationRegistry = new ActionConfiguration();
