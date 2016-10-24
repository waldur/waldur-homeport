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
      'premiumSupport',
      'notifications',
      'alerts'
    ],
    featuresVisible: false,
    appStoreCategories: [
      {
        name: 'Virtual machines',
        type: 'provider',
        icon: 'desktop',
        services: ['Amazon', 'DigitalOcean', 'OpenStack']
      },
      {
        name: 'Storages',
        type: 'provider',
        key: 'storages',
        services: ['OpenStack']
      }
    ],
    serviceCategories: [
      {
        name: 'Virtual machines',
        services: ['Amazon', 'DigitalOcean', 'OpenStack'],
      }
    ],
    futureCategories: [
      'support',
      'apps',
    ]
  });
