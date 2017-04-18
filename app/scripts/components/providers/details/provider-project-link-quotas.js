import template from './provider-project-link-quotas.html';

const providerProjectLinkQuotas = {
  template: template,
  bindings: {
    choices: '<',
  },
  require: {
    mainForm: '^form',
  },
  controller: class ProviderProjectLinkQuotasController {
    constructor (coreUtils, $scope, $rootScope, quotasService, $q) {
      let ctrl = this;
      ctrl.coreUtils = coreUtils;
      ctrl.multiplyFactor = 1024;
      ctrl.quotaNames = ['ram', 'vcpu', 'storage'];
      ctrl.quotasService = quotasService;
      ctrl.$q = $q;

      ctrl.initializeChoices();
      $scope.$on('onLinkCreated', ctrl.onLinkCreated);
      $scope.$on('onSave', ctrl.onSave);
    }
    initializeChoices() {
      let ctrl = this;
      angular.forEach(ctrl.choices, function(choice){
        choice.quotas = {};

        angular.forEach(ctrl.quotaNames, function(name) {
          choice.quotas[name] = {
            limit: 1,
            usage: 0,
            name: name
          };
          if (name !== 'vcpu') {
            choice.quotas[name].limit = choice.quotas[name].limit * 1024;
          }

          if (choice.link && choice.link.quotas && choice.link.quotas.length > 1) {
            choice.quotas[name] = choice.link.quotas.filter(function(quota){return quota.name === name;})[0];
          }

        });
      });
    }
    exceeds(quota) {
      return quota.limit < quota.usage;
    }
    getUsageSummary(quota){
      let usage = quota.usage;
      if (quota.name !== 'vcpu') {
        usage = (usage / this.multiplyFactor).toFixed(2);
      }
      return this.coreUtils.templateFormatter(gettext('{usage} used'), {
        usage: usage,
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
        let updatePromises = link.quotas.map(function(quota) {
          choice.quotas[quota.name].url = quota.url;
          return ctrl.quotasService.update(choice.quotas[quota.name]);
        });

        ctrl.$q.all(updatePromises).catch(function(response){
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

      ctrl.choices.filter(function(choice){
        return choice.selected && choice.link_url && choice.dirty;
      }).map(function(choice){
        return ctrl.quotaNames.map(function(name){
          return ctrl.quotasService.update(choice.quotas[name]).then(function(){
            choice.dirty = false;
            choice.subtitle = gettext('Quotas have been updated.');
          }).catch(function(response){
            let reason = '';
            if (response.data && response.data.detail) {
              reason = response.data.detail;
            }
            choice.subtitle = gettext('Unable to update quotas.') + ' ' + reason;
          });
        });
      });

      let clearedChoices = ctrl.choices.filter(function(choice){
        return !choice.selected && !choice.link_url;
      });

      angular.forEach(clearedChoices, function(choice){
        angular.forEach(ctrl.quotaNames, function(name){
          choice.quotas[name].usage = 0;
        });
      });
    }
  }
};

export default providerProjectLinkQuotas;
