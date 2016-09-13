'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modePortal',
    toBeFeatures: [
      'localSignup',
      'localSignin',
      'password',
      'people',
      'compare',
      'templates',
      'sizing',
      'projectGroups',
      'apps',
      'premiumSupport'
    ],
    featuresVisible: false,
    appStoreCategories: [
      {
        name: 'Virtual machines',
        type: 'provider',
        icon: 'desktop',
        services: ['Amazon', 'DigitalOcean', 'OpenStack']
      }
    ],
    serviceCategories: [
      {
        name: 'Virtual machines',
        services: ['Amazon', 'DigitalOcean', 'OpenStack'],
      }
    ],
    futureCategories: [
      'private_clouds',
      'support',
      'apps',
    ]
  });
