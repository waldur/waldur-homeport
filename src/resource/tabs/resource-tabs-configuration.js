export default class ResourceTabsConfiguration {
  constructor() {
    this.tabs = {};
  }

  register(type, tabs) {
    this.tabs[type] = tabs;
  }

  $get() {
    return this.tabs;
  }
}
