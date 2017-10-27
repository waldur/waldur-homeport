import template from './resource-global-list-filtered.html';

const RESOURCE_STATES = [
  'OK',
  'Erred',
  'Creation Scheduled',
  'Creating',
  'Update Scheduled',
  'Updating',
  'Deletion Scheduled',
  'Deleting'
];

const resourceGlobalListFiltered = {
  template,
  controller: class ResourceGlobalListFilteredController {
    // @ngInject
    constructor(ENV) {
      this.ENV = ENV;

      const resourceTypes = Object.keys(this.ENV.resourceCategory);
      this.resourceTypeOptions = this.getOptions(resourceTypes);
      this.stateOptions = this.getOptions(RESOURCE_STATES);
      this.filter = {};
    }

    getOptions(choices) {
      return choices.sort().map(choice => ({
        display_name: choice.split('.').join(' '),
        value: choice
      }));
    }

    onResourceTypeSelect() {
      if (this.resourceTypeFilter) {
        this.filter.resource_type = this.resourceTypeFilter.value;
      } else {
        delete this.filter.resource_type;
      }
    }

    onStateSelect() {
      if (this.stateFilter) {
        this.filter.state = this.stateFilter.value;
      } else {
        delete this.filter.state;
      }
    }

  }
};

export default resourceGlobalListFiltered;
