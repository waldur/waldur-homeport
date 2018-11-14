import template from './resource-global-list-filtered.html';
import { getServiceIcon } from '@waldur/providers/registry';

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
    constructor(ENV, HttpUtils) {
      this.ENV = ENV;
      this.HttpUtils = HttpUtils;

      const resourceTypes = Object.keys(this.ENV.resourceCategory);
      this.resourceTypeOptions = this.getOptions(resourceTypes);
      this.stateOptions = this.getOptions(RESOURCE_STATES);
      this.serviceProviderOptions = [];
      this.filter = {};
    }

    $onInit() {
      this.getServiceProviderOptions();
    }

    getServiceProviderOptions() {
      const url = `${this.ENV.apiEndpoint}api/service-settings/?has_resources=true`;
      this.HttpUtils.getAll(url).then(options => {
        this.serviceProviderOptions = options.reduce((acc, option) => {
          acc.push({
            display_name: option.name,
            value: option.uuid,
            img_src: getServiceIcon(option.type),
            type: option.type
          });
          return acc;
        }, []);
      });
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

    onServiceProviderSelect() {
      if (this.serviceProviderFilter) {
        this.filter.service_settings_uuid = this.serviceProviderFilter.value;
      } else {
        delete this.filter.service_settings_uuid;
      }
    }

    onExternalIpChange() {
      if (this.externalIp) {
        this.filter.external_ip = this.externalIp;
      } else {
        delete this.filter.external_ip;
      }
    }

  }
};

export default resourceGlobalListFiltered;
