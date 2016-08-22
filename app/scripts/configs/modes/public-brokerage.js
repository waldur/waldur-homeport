'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modePublicBrokerage',
    toBeFeatures: [
      'localSignup',
      'people',
      'templates',
      'monitoring',
      'projectGroups',
      'estonianId'
    ],
    featuresVisible: false
  });
