'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modePrivateIaas',
    toBeFeatures: [
      'plans',
      'providers',
      'services',
      'eventlog',
      'backups',
      'localSignup',
      'users',
      'people',
      'import',
      'servicesadd',
      'projectGroups'
    ],
    featuresVisible: false,
    appStoreCategories: [
      {
        name: 'VMs',
        type: 'provider',
        services: ['OpenStack']
      }
    ],
    serviceCategories: [],
    homeTemplate: 'views/home/private-iaas/home.html',
    homeHeaderTemplate: 'views/partials/private-iaas/site-header.html',
    homeLoginTemplate: 'views/home/private-iaas/login.html'
  });
