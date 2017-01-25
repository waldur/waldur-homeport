export default class ActionConfiguration {
  constructor() {
    this.resources = {};
  }

  register(type, config) {
    this.resources[type] = config;
    angular.forEach(config.options, (options, name) => {
      options.name = name;
    });
  }

  $get() {
    return this.resources;
  }
}
