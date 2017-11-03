import template from './provider-project-link-quotas.html';

const providerProjectLinkQuotas = {
  template: template,
  bindings: {
    choices: '<',
  },
  controller: class ProviderProjectLinkQuotasController {
    // @ngInject
    constructor ($scope, quotasService, $q) {
      this.multiplyFactor = 1024;
      this.quotaNames = ['ram', 'vcpu', 'storage'];
      this.quotasService = quotasService;
      this.$q = $q;

      $scope.$on('onSave', this.onSave.bind(this));
    }
    $onInit(){
      this.initializeChoices();
    }
    initializeChoices() {
      angular.forEach(this.choices, (choice) => {
        choice.quotas = {};

        angular.forEach(this.quotaNames, (name) => {
          choice.quotas[name] = {
            limit: 0,
            usage: 0,
            name: name,
            unlimited: true,
          };

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
    onSave() {
      this.choices.filter((choice) => {
        return choice.selected && choice.link_url && choice.dirty;
      }).map((choice) => {
        let updateQuotasPromises = this.quotaNames.map((name) => {
          choice.quotas[name].url = choice.link.quotas.filter((quota) => { return quota.name === name; })[0].url;
          return this.updateQuota(choice.quotas[name]).then(() => {
            if (choice.dirty) {
              choice.subtitle = gettext('Quotas updated.');
            }
            choice.dirty = false;
          });
        });

        this.$q.all(updateQuotasPromises).catch((response) => {
          let reason = '';
          if (response.data && response.data.detail) {
            reason = response.data.detail;
          }
          choice.subtitle = gettext('Unable to set quotas.') + ' ' + reason;
        });
      });

      let clearedChoices = this.choices.filter((choice) => {
        return !choice.selected && !choice.link_url;
      });

      angular.forEach(clearedChoices, (choice) => {
        angular.forEach(this.quotaNames, (name) => {
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
