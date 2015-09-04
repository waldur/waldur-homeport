'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modeSquStudentCloud',
    toBeFeatures: [
      'monitoring',
      'backups',
      'password',
      'services',
      'providers'
    ],
    featuresVisible: false,
    appStoreCategories: [
      {
        name: 'VMs',
        type: 'provider',
        services: ['OpenStack']
      },
      {
        name: 'APPLICATIONS',
        type: 'provider',
        services: ['GitLab']
      }
    ],
    serviceCategories: [],
    homeTemplate: false,
    initialDataTemplate: false
  });
