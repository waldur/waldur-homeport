// @ngInject
export default function($ocLazyLoad) {
  return import(/* webpackChunkName: "analytics" */ './module')
    .then(module => $ocLazyLoad.load({name: module.default}));
}
