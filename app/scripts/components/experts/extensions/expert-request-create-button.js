import template from './expert-request-create-button.html';
import { APPSTORE_CATEGORY } from './../constants';

const expertRequestCreateButton = {
  template,
  bindings: {
    selectProject: '<',
  },
  controller: class ExpertRequestCreateButtonController {
    // @ngInject
    constructor(AppStoreUtilsService) {
      this.AppStoreUtilsService = AppStoreUtilsService;
    }

    openExpertsStore() {
      return this.AppStoreUtilsService.openDialog({currentCategory: APPSTORE_CATEGORY, selectProject: this.selectProject});
    }
  }
};

export default expertRequestCreateButton;
