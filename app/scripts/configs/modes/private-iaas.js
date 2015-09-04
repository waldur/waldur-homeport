'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modePrivateIaas',
    toBeFeatures: [
      'plans',
      'providers',
      'services',
      'eventlog'
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
    homeTemplate: false,
    initialDataTemplate: false
  });
