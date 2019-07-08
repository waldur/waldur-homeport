import { isOracleOffering } from '@waldur/offering/utils';

import template from './offering-details.html';
import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

const offeringDetails = {
  template,
  controller: class OfferingDetailsController {
    // @ngInject
    constructor(
      offeringsService,
      projectsService,
      customersService,
      currentStateService,
      WorkspaceService,
      BreadcrumbsService,
      ncUtilsFlash,
      $stateParams,
      $state) {
      this.offeringsService = offeringsService;
      this.projectsService = projectsService;
      this.customersService = customersService;
      this.currentStateService = currentStateService;
      this.WorkspaceService = WorkspaceService;
      this.BreadcrumbsService = BreadcrumbsService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.$stateParams = $stateParams;
      this.$state = $state;
    }

    $onInit() {
      if (!this.$stateParams.uuid) {
        this.$state.go('errorPage.notFound');
        return;
      }
      this.offeringsService.$get(this.$stateParams.uuid)
        .then(offering => {
          this.offering = offering;
          return this.projectsService.$get(offering.project_uuid).then(project => {
            return { project };
          });
        })
        .then(({ project }) => {
          return this.customersService.$get(project.customer_uuid).then(customer => {
            this.currentStateService.setCustomer(customer);
            this.currentStateService.setProject(project);
            return { customer, project };
          });
        })
        .then(({ customer, project }) => {
          this.WorkspaceService.setWorkspace({
            customer: customer,
            project: project,
            hasCustomer: true,
            workspace: WOKSPACE_NAMES.project,
          });
        })
        .then(() => this.offeringsService.getOffering(this.offering.template_uuid).then(template => {
          this.offeringConfig = template.config;
        }))
        .then(() => this.refreshBreadcrumbs())
        .catch(() => {
          this.$state.go('errorPage.notFound');
        });
    }

    reInitResource(offering) {
      return this.offeringsService.$get(offering.uuid).then(response => {
        this.offering = response;
        this.refreshBreadcrumbs();
      });
    }

    refreshBreadcrumbs() {
      this.BreadcrumbsService.items = [
        {
          label: gettext('Project workspace'),
          state: 'project.details',
          params: {
            uuid: this.offering.project_uuid
          }
        },
        {
          label: gettext('Resources'),
        },
        {
          label: gettext('Requests'),
          state: 'project.resources.offerings',
          params: {
            uuid: this.offering.project_uuid
          }
        }
      ];
      if (isOracleOffering(this.offering)) {
        this.BreadcrumbsService.items[this.BreadcrumbsService.items.length - 1] = {
          label: gettext('Oracle'),
          state: 'project.resources.oracle',
          params: {
            uuid: this.offering.project_uuid
          }
        };
      } else if (this.offering.marketplace_category_name) {
        this.BreadcrumbsService.items[this.BreadcrumbsService.items.length - 1] = {
          label: this.offering.marketplace_category_name,
          state: 'marketplace-project-resources',
          params: {
            category_uuid: this.offering.marketplace_category_uuid,
            uuid: this.offering.project_uuid,
          },
        };
      }
      this.BreadcrumbsService.activeItem = this.offering.name;
    }

    afterInstanceRemove() {
      this.offeringsService.clearAllCacheForCurrentEndpoint();
      const state = isOracleOffering(this.offering) ? 'project.resources.oracle' : 'project.resources.offerings';
      this.$state.go(state, {uuid: this.offering.project_uuid});
    }

    handleActionException(response) {
      if (response.status === 409) {
        let message = response.data.detail || response.data.status;
        this.ncUtilsFlash.error(message);
      }
    }

    get showReportButton() {
      return !isOracleOffering(this.offering) && this.offering.report;
    }
  }
};

export default offeringDetails;
