import template from './help-list.html';
import HelpRegistry from './help-registry';

const helpList = {
  template: template,
  controller: class HelpListController {
    $onInit() {
      this.helpData = HelpRegistry.getSorted();
    }
  }
};

export default helpList;
