'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modePortal',
    toBeFeatures: [
      'localSignup',
      'localSignin',
      'team',
      'monitoring',
      'backups',
      'templates',
      'sizing',
      'projectGroups'
    ],
    featuresVisible: false,
    comingFeatures: [
      'applications',
    ]
  });
