import template from './openstack-tenant-summary.html';
import { getTenantTemplate } from '../utils';

const openstackTenantSummary = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class OpenstackTenantSummaryController {
    // @ngInject
    constructor($scope, ENV) {
      this.tenantCredentialsVisible = ENV.tenantCredentialsVisible;

      $scope.$watch(() => this.resource, () => {
        this.template = getTenantTemplate(this.resource);
      });
    }
  }
};

export default openstackTenantSummary;
