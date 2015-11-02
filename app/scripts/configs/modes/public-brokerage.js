'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modePublicBrokerage',
    toBeFeatures: [
      'localSignup',
      'users',
      'people',
      'backups',
      'templates',
      'monitoring',
      'projectGroups'
    ],
    featuresVisible: false
  });
