'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modePublicBrokerage',
    toBeFeatures: [
      'eventlog',
      'localSignup',
      'users',
      'people',
      'backups'
    ],
    featuresVisible: false
  });
