// @ngInject
export default function errorUtilsService($state) {

  this.getBackLink = function(state, params) {
    return (state && state.name !== 'errorPage.notFound' && state.name !== 'errorPage.limitQuota')
      ? $state.href(state.name, params)
      : $state.href('profile.details');
  };
}
