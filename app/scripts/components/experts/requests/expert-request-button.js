import template from './expert-request-button.html';
import { APPSTORE_CATEGORY } from './../constants';

const expertRequestButton = {
  template,
  controller: class {
    // @ngInject
    constructor(AppStoreUtilsService) {
      this.AppStoreUtilsService = AppStoreUtilsService;
    }

    openExpertsStore() {
      return this.AppStoreUtilsService.openDialog({currentCategory: APPSTORE_CATEGORY});
    }
  }
};

export default expertRequestButton;
