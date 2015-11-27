'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modeCostTracking',
    modePageTitle: 'TrackMyCosts.com',
    toBeFeatures: [
      'payment',
      'eventlog',
      'localSignup',
      'users',
      'people',
      'backups',
      'templates',
      'monitoring',
      'projectGroups',
      'premiumSupport'
    ],
    featuresVisible: false,
    homeTemplate: 'views/home/costtracking/home.html',
    homeHeaderTemplate: 'views/partials/costtracking/site-header.html',
    homeLoginTemplate: 'views/home/costtracking/login.html',
    initialDataTemplate: 'views/initial-data/initial-data.html',
    aboutPageTemplate: 'views/about/costtracking/index.html'
  });
