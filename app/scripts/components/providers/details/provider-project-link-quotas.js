import template from './provider-project-link-quotas.html';

const providerProjectLinkQuotas = {
  template: template,
  bindings: {
    choices: '<',
  },
  controller: class ProviderProjectLinkQuotasController {
    constructor (coreUtils, $scope, quotasService, $q, $filter) {
      this.coreUtils = coreUtils;
      this.multiplyFactor = 1024;
      this.quotaNames = ['ram', 'vcpu', 'storage'];
      this.quotasService = quotasService;
      this.$q = $q;
      this.$filter = $filter;

      this.initializeChoices();
      $scope.$on('onLinkCreated', this.onLinkCreated);
      $scope.$on('onSave', this.onSave);
    }
    initializeChoices() {
      let ctrl = this;
      angular.forEach(ctrl.choices, (choice) => {
        choice.quotas = {};

        angular.forEach(ctrl.quotaNames, (name) => {
          choice.quotas[name] = {
            limit: 1,
            usage: 0,
            name: name
          };
          if (name !== 'vcpu') {
            choice.quotas[name].limit = choice.quotas[name].limit * 1024;
          }

          if (choice.link && choice.link.quotas && choice.link.quotas.length > 1) {
            choice.quotas[name] = choice.link.quotas.filter((quota) => {return quota.name === name;})[0];
          }

        });
      });
    }
    exceeds(quota) {
      return quota.limit < quota.usage;
    }
    getUsageSummary(quota){
      return this.coreUtils.templateFormatter(gettext('{usage} used'), {
        usage: this.$filter('quotaValue')(quota.usage, quota.name),
      });
    }
    getPercentage(quota){
      let percentage = quota.usage / quota.limit * 100;
      if (percentage <= 0) {
        return 0;
      } else if (percentage > 100 || quota.limit < quota.usage) {
        return 100;
      }

      return percentage;
    }
    onLinkCreated(event, data) {
      let choice = data.choice;
      let link = choice.link;
      let ctrl = event.currentScope.$ctrl;

      if (link.quotas && link.quotas.length > 0) {
        let updatePromises = link.quotas.map((quota) => {
          choice.quotas[quota.name].url = quota.url;
          return ctrl.quotasService.update(choice.quotas[quota.name]);
        });

        ctrl.$q.all(updatePromises).catch((response) => {
          let reason = '';
          if (response.data && response.data.detail) {
            reason = response.data.detail;
          }
          choice.subtitle = gettext('Unable to set quotas.') + ' ' + reason;
        });
      }
    }
    onSave(event) {
      let ctrl = event.currentScope.$ctrl;

      ctrl.choices.filter((choice) => {
        return choice.selected && choice.link_url && choice.dirty;
      }).map((choice) => {
        return ctrl.quotaNames.map((name) => {
          return ctrl.quotasService.update(choice.quotas[name]).then(() => {
            choice.dirty = false;
            choice.subtitle = gettext('Quotas have been updated.');
          }).catch((response) => {
            let reason = '';
            if (response.data && response.data.detail) {
              reason = response.data.detail;
            }
            choice.subtitle = gettext('Unable to update quotas.') + ' ' + reason;
          });
        });
      });

      let clearedChoices = ctrl.choices.filter((choice) => {
        return !choice.selected && !choice.link_url;
      });

      angular.forEach(clearedChoices, (choice) => {
        angular.forEach(ctrl.quotaNames, (name) => {
          choice.quotas[name].usage = 0;
        });
      });
    }
  }
};

export default providerProjectLinkQuotas;
