export default class ResourceFieldConfiguration {
  constructor() {
    this.resourceFields = {};
  }

  register(field, configs) {
    this.resourceFields[field] = configs;
  }

  $get() {
    return this.resourceFields;
  }
}
