export default class AppStoreUtilsService {
  constructor($uibModal, ENV) {
    this.$uibModal = $uibModal;
    this.ENV = ENV;
  }

  openDialog(options) {
    this.$uibModal.open({
      component: 'appstoreCategorySelector',
      size: 'lg',
      resolve: {
        selectProject: function() {
          return options && options.selectProject;
        }
      }
    });
  }

  findOffering(key) {
    var offerings = this.ENV.offerings;
    for (var i = 0; i < offerings.length; i++) {
      if (offerings[i].key === key) {
        return offerings[i];
      }
    }
  }
}
