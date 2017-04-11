// @ngInject
export default function CategoriesService(ENV) {
  return {
    getServiceCategories,
    getResourceCategories,
  };

  function serviceIsEnabled(service) {
    return ENV.disabledServices.indexOf(service) === -1;
  }

  function prepareCategory(category) {
    return angular.extend({}, category, {
      services: category.services.filter(serviceIsEnabled)
    });
  }

  function getServiceCategories() {
    return ENV.serviceCategories.map(prepareCategory);
  }

  function getResourceCategories() {
    return ENV.appStoreCategories.map(prepareCategory);
  }
}
