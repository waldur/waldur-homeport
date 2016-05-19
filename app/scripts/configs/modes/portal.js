'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modePortal',
    toBeFeatures: [
      'localSignup',
      'localSignin',
      'password',
      'team',
      'people',
      'monitoring',
      'backups',
      'templates',
      'sizing',
      'projectGroups',
      'apps',
      'premiumSupport'
    ],
    featuresVisible: false,
    appStoreCategories: [
      {
        name: 'VMs',
        type: 'provider',
        icon: 'desktop',
        services: ['Amazon', 'DigitalOcean', 'OpenStack']
      },
      {
        name: 'Private clouds',
        type: 'provider',
        icon: 'cloud',
        services: ['OpenStack']
      }
    ],
    serviceCategories: [
      {
        name: 'Virtual machines',
        services: ['Amazon', 'DigitalOcean', 'OpenStack'],
      }
    ]
  });
