// @ngInject
export default function translateProvider($translateProvider) {
  $translateProvider.useLocalStorage();
  $translateProvider.useStaticFilesLoader({
    prefix: 'scripts/i18n/locale-',
    suffix: '.json'
  });
  $translateProvider.useSanitizeValueStrategy('escaped');
}
