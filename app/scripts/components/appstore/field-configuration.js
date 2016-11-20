export default class AppstoreFieldConfiguration {
    constructor() {
      this.fields = {};
    }

    register(resourceType, resourceFields) {
      this.fields[resourceType] = resourceFields;
    }

    $get() {
      return this.fields;
    }
}
