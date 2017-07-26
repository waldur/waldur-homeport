export default class AppStoreUtilsService {
  constructor($uibModal, ENV) {
    this.$uibModal = $uibModal;
    this.ENV = ENV;
  }

  openDialog(options) {
    // options is an object with fields:
    // currentCategory: string - name of category to be selected
    // selectProject: boolean - allows to toogle display of project selector
    this.$uibModal.open({
      component: 'appstoreSelectorDialog',
      size: 'lg',
      resolve: {
        options: () => options || {},
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
