export default class ResourceStateConfiguration {
  constructor() {
    this.resourceStates = {};
  }

  register(type, states) {
    this.resourceStates[type] = states;
  }

  $get() {
    return this.resourceStates;
  }
}
