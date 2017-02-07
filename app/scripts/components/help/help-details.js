import {profileHelp, dashboardHelp, providersHelp} from './constants';
import './help-details.scss';

const helpDetails = {
  templateUrl: 'views/help/details.html',
  controllerAs: 'HelpDetails',
  controller: class HelpDetailsController {
    constructor($stateParams, alertsService, eventsService) {
      // @ngInject
      this.$stateParams = $stateParams;
      this.alertsService = alertsService;
      this.eventsService = eventsService;
    }

    $onInit() {
      this.model = this.getItem();
    }

    getItem() {
      switch(this.$stateParams.name) {
      case profileHelp.sshKeys.name:
        return profileHelp.sshKeys;

      case dashboardHelp.alertsList.name:
        return angular.extend({
          types: this.alertsService.getAvailableIconTypes()
        }, dashboardHelp.alertsList);

      case dashboardHelp.eventsList.name:
        return angular.extend({
          types: this.eventsService.getAvailableIconTypes()
        }, dashboardHelp.eventsList);

      default:
        return providersHelp.filter(item => item.key === this.$stateParams.name)[0];
      }
    }
  }
};

export default helpDetails;
