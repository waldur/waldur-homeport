'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modePublicBrokerage',
    toBeFeatures: [
      'eventlog',
      'localSignup'
    ],
    featuresVisible: false
  });
