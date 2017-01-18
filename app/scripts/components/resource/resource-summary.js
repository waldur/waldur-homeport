import template from './resource-summary.html';
import './resource-summary.scss';

const resourceSummary = {
  bindings: {
    resource: '<'
  },
  template: template,
  controller: class ResourceSummaryController {
    // @ngInject
    constructor(resourceUtils, ncUtils, currentStateService, ENV) {
      this.resourceUtils = resourceUtils;
      this.ncUtils = ncUtils;
      this.currentStateService = currentStateService;
      this.ENV = ENV;
    }

    $onChanges(changes) {
      let resource = changes.resource.currentValue;
      if (!resource) {
        return;
      }

      this.resourceUtils.setAccessInfo(resource);
      resource.service_type = resource.resource_type.split('.')[0];
      resource.customer_uuid = this.currentStateService.getCustomerUuid();
      resource.error_message = resource.error_message || this.ENV.defaultErrorMessage;
    }
  }
};

export default resourceSummary;
