'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modeSquStudentCloud',
    toBeFeatures: [
      'monitoring',
      'backups',
      'password',
      'services',
      'providers',
      'premiumSupport',
      'servicesadd'
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
    homeTemplate: 'views/home/squ-student-cloud/home.html',
    initialDataTemplate: 'views/initial-data/omancloud/initial-data.html'
  });
