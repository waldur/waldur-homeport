import HelpRegistry from '../help/help-registry';
import template from './help-details.html';
import './help-details.scss';

const helpDetails = {
  template: template,
  controller: class HelpDetailsController {
    // @ngInject
    constructor($stateParams) {
      this.$stateParams = $stateParams;
    }

    $onInit() {
      this.model = this.getModel();
    }

    getModel() {
      const helpData = HelpRegistry.get();
      const helpItems = helpData[this.$stateParams.type].helpItems;
      for(let item of helpItems) {
        if (item.key !== this.$stateParams.name) continue;
        return item;
      }
      return null;
    }
  }
};

export default helpDetails;
