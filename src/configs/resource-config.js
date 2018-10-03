// @ngInject
export default function resourceProvider($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
}
