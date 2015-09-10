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
      'people'
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
    homeTemplate: 'views/home/omancloud/home.html',
    initialDataTemplate: 'views/initial-data/omancloud/initial-data.html'
  });
