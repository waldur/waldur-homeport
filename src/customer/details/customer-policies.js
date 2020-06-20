import { isFeatureVisible } from '@waldur/features/connect';
import { FreeIPAQuotaService } from '@waldur/freeipa/FreeIPAQuotaService';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import { getCustomer } from '@waldur/workspace/selectors';

import { PriceEstimatesService } from '../services/price-estimates-service';

import template from './customer-policies.html';

const customerPolicies = {
  template: template,
  controller: class CustomerPoliciesController {
    // @ngInject
    constructor($q, ENV, ncUtilsFlash) {
      this.$q = $q;
      this.ENV = ENV;
      this.ncUtilsFlash = ncUtilsFlash;
    }

    $onInit() {
      this.freeipaVisible = isFeatureVisible('freeipa');
      UsersService.getCurrentUser().then((currentUser) => {
        const currentCustomer = getCustomer(store.getState());
        this.user = currentUser;
        this.originalCustomer = currentCustomer;
        this.customer = angular.copy(currentCustomer);
        this.thresholdModel = {
          isHardLimit: PriceEstimatesService.isHardLimit(
            this.customer.billing_price_estimate,
          ),
          priceEstimate: this.customer.billing_price_estimate,
        };
        this.thresholdField = {
          horizontal: true,
        };

        this.currency = this.ENV.currency;
        this.quota = FreeIPAQuotaService.loadQuota(this.customer);
        this.actionsExpanded = false;
      });
    }

    updatePolicies() {
      const promises = [
        PriceEstimatesService.update(this.thresholdModel.priceEstimate).then(
          () => {
            this.originalCustomer.billing_price_estimate.limit = this.thresholdModel.priceEstimate.limit;
            this.originalCustomer.billing_price_estimate.threshold = this.thresholdModel.priceEstimate.threshold;
          },
        ),
      ];

      if (this.quota) {
        promises.push(
          FreeIPAQuotaService.saveQuota(this.originalCustomer, this.quota),
        );
      }

      return this.$q
        .all(promises)
        .then(() => {
          this.ncUtilsFlash.success(
            gettext('Organization policies have been updated.'),
          );
        })
        .catch((response) => {
          if (response.status === 400) {
            for (const name in response.data) {
              const message = response.data[name];
              this.ncUtilsFlash.error(message);
            }
          } else {
            this.ncUtilsFlash.error(
              gettext('An error occurred on policies update.'),
            );
          }
        });
    }

    toggleActions() {
      this.actionsExpanded = !this.actionsExpanded;
    }
  },
};

export default customerPolicies;
