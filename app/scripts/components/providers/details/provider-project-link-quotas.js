import template from './provider-project-link-quotas.html';

const providerProjectLinkQuotas = {
  template: template,
  bindings: {
    choices: '<',
  },
  controller: class ProviderProjectLinkQuotasController {
    constructor ($scope, quotasService, $q) {
      this.multiplyFactor = 1024;
      this.quotaNames = ['ram', 'vcpu', 'storage'];
      this.quotasService = quotasService;
      this.$q = $q;

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
            name: name,
          };
          if (['ram', 'storage'].indexOf(name) >= 0) {
            choice.quotas[name].limit = choice.quotas[name].limit * 1024;
          }

          if (choice.link && choice.link.quotas && choice.link.quotas.length > 1) {
            choice.quotas[name] = choice.link.quotas.filter((quota) => {return quota.name === name;})[0];
          }

          if (choice.quotas[name].limit === -1) {
            choice.quotas[name].unlimited = true;
            choice.quotas[name].limit = 0;
          }

        });
      });
    }
    onLinkCreated(event, data) {
      let choice = data.choice;
      let link = choice.link;
      let ctrl = event.currentScope.$ctrl;

      if (link.quotas && link.quotas.length > 0) {
        let updatePromises = link.quotas.map((quota) => {
          choice.quotas[quota.name].url = quota.url;
          choice.new = true;
          return ctrl.updateQuota(choice.quotas[quota.name]);
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
        return choice.selected && choice.link_url && choice.dirty && !choice.new;
      }).map((choice) => {
        let updateQuotasPromises = ctrl.quotaNames.map((name) => {
          choice.quotas[name].url = choice.link.quotas.filter((quota) => { return quota.name === name; })[0].url;
          return ctrl.updateQuota(choice.quotas[name]).then(() => {
            choice.dirty = choice.new = false;
            choice.subtitle = gettext('Quotas updated.');
          });
        });

        ctrl.$q.all(updateQuotasPromises).catch((response) => {
          let reason = '';
          if (response.data && response.data.detail) {
            reason = response.data.detail;
          }
          choice.subtitle = gettext('Unable to update quotas.') + ' ' + reason;
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
    updateQuota(quota) {
      let payload = {
        limit: quota.unlimited ? -1 : quota.limit,
        url: quota.url
      };

      return this.quotasService.update(payload);
    }
  }
};

export default providerProjectLinkQuotas;
