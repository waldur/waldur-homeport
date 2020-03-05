// @ngInject
export default function setTitleFromState(
  $rootScope,
  ENV,
  titleService,
  $filter,
) {
  $rootScope.$on('$stateChangeSuccess', (event, toState) => {
    let title = ENV.modePageTitle;
    if (toState.data && toState.data.pageTitle) {
      title =
        ENV.shortPageTitle +
        ' | ' +
        $filter('translate')(toState.data.pageTitle);
    }
    titleService.setTitle(title);
  });
}
