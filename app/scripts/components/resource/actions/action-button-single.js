import template from './action-button-single.html';

const actionButtonSingle = {
  template,
  bindings: {
    buttonController: '<',
    actionName: '@'
  },
  controller: class ActionButtonSingleController {
    constructor(ncUtils, actionUtilsService) {
      this.ncUtils = ncUtils;
      this.actionUtilsService = actionUtilsService;
      this.action = null;
      this.buttonModel = this.buttonController.resource;
    }

    onClick() {
      if (!this.action.enabled) {
        return;
      }
      this.actionUtilsService.buttonClick(this.buttonController, this.buttonModel, this.actionName, this.action);
    }

    $onInit() {
      this.actionUtilsService.loadActions(this.buttonModel).then(actions => {
        this.action = actions[this.actionName];
      });

      // TODO: implement single action loading
      // this.actionUtilsService.loadAction(this.buttonModel, this.actionName).then(action => {
      //   this.action = action;
      // })
    }
  }
};

export default actionButtonSingle;
