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
    homeTemplate: 'views/home/omancloud/home.html',
    initialDataTemplate: 'views/initial-data/omancloud/initial-data.html'
  });
