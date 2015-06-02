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
    .value('LANGUAGE', {
        CHOICES: [
            {code: 'en', label: 'English'}
        ],
        DEFAULT: 'en'
    });
})();
