'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modeCostTracking',
    toBeFeatures: [
      'appstore',
      'payment',
      'eventlog'
    ],
    featuresVisible: false,
    homeTemplate: false,
    initialDataTemplate: false
  });
