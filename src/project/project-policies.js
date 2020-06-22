import { CustomersService } from '@waldur/customer/services/CustomersService';
import { PriceEstimatesService } from '@waldur/customer/services/PriceEstimatesService';
import { isFeatureVisible } from '@waldur/features/connect';
import { FreeIPAQuotaService } from '@waldur/freeipa/FreeIPAQuotaService';

import { loadCertifications, updateCertifications } from './api';
import template from './project-policies.html';

const projectPolicies = {
  template: template,
  bindings: {
    project: '<',
  },
  controller: class ProjectPoliciesController {
    // @ngInject
    constructor(ENV, ncUtilsFlash, $rootScope, $q) {
      this.ENV = ENV;
      this.ncUtilsFlash = ncUtilsFlash;
      this.$rootScope = $rootScope;
      this.$q = $q;
    }

    $onInit() {
      this.projectCostDetailsVisible = isFeatureVisible('projectCostDetails');
      this.currency = this.ENV.currency;
      this.canManage = false;
      this.projectCertifications = angular.copy(this.project.certifications);
      this.certificationsList = this.project.certifications
        .map((x) => x.name)
        .join(', ');

      this.estimate = angular.copy(this.project.billing_price_estimate);
      this.isHardLimit = this.checkIsHardLimit(this.estimate);
      this.quota = FreeIPAQuotaService.loadQuota(this.project);

      this.loading = true;
      this.$q
        .all([
          loadCertifications().then((certifications) => {
            this.certifications = certifications;
          }),

          CustomersService.isOwnerOrStaff().then((canManage) => {
            this.canManage = canManage;
          }),
        ])
        .finally(() => (this.loading = false));
    }

    updatePolicies() {
      const promises = [this.updatePriceEstimate(), this.saveCertifications()];

      if (this.quota) {
        promises.push(FreeIPAQuotaService.saveQuota(this.project, this.quota));
      }

      return this.$q
        .all(promises)
        .then(() => {
          this.ncUtilsFlash.success(
            gettext('Project policies have been updated.'),
          );
        })
        .catch((response) => {
          if (response.status === 400) {
            for (const name in response.data) {
              const error = response.data[name];
              this.ncUtilsFlash.error(error);
            }
          } else {
            this.ncUtilsFlash.error(
              gettext('An error occurred during policy update.'),
            );
          }
        });
    }

    updatePriceEstimate() {
      const limit = this.isHardLimit ? this.estimate.threshold : -1;
      return PriceEstimatesService.update(this.estimate).then(() => {
        this.project.billing_price_estimate.threshold = this.estimate.threshold;
        this.project.billing_price_estimate.limit = limit;
      });
    }

    saveCertifications() {
      function mapItems(items) {
        return items.map((item) => ({ url: item.url }));
      }
      const oldItems = mapItems(this.project.certifications);
      const newItems = mapItems(this.projectCertifications);
      if (angular.equals(oldItems, newItems)) {
        return this.$q.resolve();
      } else {
        return updateCertifications(this.project.uuid, newItems).then(() => {
          this.$rootScope.$broadcast('refreshProjectList');
        });
      }
    }

    checkIsHardLimit(estimate) {
      return estimate.limit > 0 && estimate.limit === estimate.threshold;
    }

    isOverThreshold() {
      return (
        this.estimate.threshold > 0 &&
        this.estimate.total >= this.estimate.threshold
      );
    }
  },
};

export default projectPolicies;
