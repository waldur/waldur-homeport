'use strict';

(function() {
  angular.module('ncsaas')
    .config(['$translateProvider', function($translateProvider) {
        $translateProvider.useLocalStorage();
        $translateProvider.useStaticFilesLoader({
            prefix: 'static/js/i18n/locale-',
            suffix: '.json'
        });
    }]);

  angular.module('ncsaas')
    .constant('LANGUAGE', {
        CHOICES: [
          {code: 'ar', label: 'Arabic'},
          {code: 'en', label: 'English'},
          {code: 'et', label: 'Estonian'},
          {code: 'fi', label: 'Finnish'},
          {code: 'ru', label: 'Russian'},
          {code: 'uk', label: 'Ukrainian'}
        ],
        DEFAULT: 'en'
    });
})();
