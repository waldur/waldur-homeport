export default class AppstoreFieldConfiguration {
  constructor() {
    this.fields = {};
  }

  registerMap(map) {
    angular.forEach(map, (config, type) => {
      this.register(type, config);
    });
  }

  register(type, config) {
    this.fields[type] = config;
    angular.forEach(config.options, (options, name) => {
      options.name = name;
    });
  }

  $get() {
    return this.fields;
  }
}
