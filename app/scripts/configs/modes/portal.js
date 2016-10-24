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
        key: 'vms',
        services: ['Amazon', 'DigitalOcean', 'OpenStack']
      },
      {
        name: 'Private clouds',
        type: 'provider',
        icon: 'cloud',
        key: 'private_clouds',
        services: ['OpenStack']
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
