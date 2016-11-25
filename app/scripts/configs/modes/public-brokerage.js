'use strict';

// It is deployed on demo

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
    featuresVisible: false,
    invitationsEnabled: false
  });
