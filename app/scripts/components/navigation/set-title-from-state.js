// @ngInject
export default function setTitleFromState($rootScope, ENV, titleService) {
  $rootScope.$on('$stateChangeSuccess', (event, toState) => {
    let title = ENV.modePageTitle;
    if (toState.data && toState.data.pageTitle) {
      title = ENV.shortPageTitle + ' | ' + toState.data.pageTitle;
    }
    titleService.setTitle(title);
  });
}
