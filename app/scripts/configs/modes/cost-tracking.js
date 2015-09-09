'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modeCostTracking',
    toBeFeatures: [
      'appstore',
      'payment',
      'eventlog',
      'localSignup'
    ],
    featuresVisible: false,
    homeTemplate: 'views/home/costtracking/home.html',
    initialDataTemplate: 'views/initial-data/initial-data.html'
  });
