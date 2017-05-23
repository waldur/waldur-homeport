// @ngInject
export default function translateProvider($translateProvider) {
  $translateProvider.useLocalStorage();
  $translateProvider.useStaticFilesLoader({
    prefix: 'static/js/i18n/locale-',
    suffix: '.json'
  });
  $translateProvider.useSanitizeValueStrategy('escaped');
}
