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

  findCategory(key) {
    var categories = this.ENV.defaultCategories;
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].key === key) {
        return categories[i];
      }
    }
  }
}
