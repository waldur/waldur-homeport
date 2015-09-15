'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modeCostTracking',
    toBeFeatures: [
      'resources',
      'payment',
      'eventlog',
      'localSignup',
      'users',
      'people',
      'backups',
      'templates',
      'monitoring',
      'projectGroups'
    ],
    featuresVisible: false,
    homeTemplate: 'views/home/costtracking/home.html',
    initialDataTemplate: 'views/initial-data/initial-data.html'
  });
