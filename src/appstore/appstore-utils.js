export default class AppStoreUtilsService {
  // @ngInject
  constructor($uibModal, ENV) {
    this.$uibModal = $uibModal;
    this.ENV = ENV;
  }

  openDialog(options) {
    /**
     * @param {Object} options Additional data for service store selector dialog.
     * @param {string} options.currentCategory The name of the category to be selected.
     * @param {boolean} options.selectProject Allows to toogle display of the project selector.
     */
    this.$uibModal.open({
      component: 'appstoreSelectorDialog',
      size: 'lg',
      resolve: {
        options: () => options || {},
      }
    });
  }

  findCategory(key) {
    let categories = this.ENV.defaultCategories;
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].key === key) {
        return categories[i];
      }
    }
  }
}
