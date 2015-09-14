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
      'users',
      'people',
      'servicesadd',
      'import',
      'templates',
      'monitoring',
      'projectGroups'
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
    emailMask: 'squ.edu.om',
    serviceCategories: [],
    homeTemplate: 'views/home/squ-student-cloud/home.html',
    homeHeaderTemplate: 'views/partials/squ-student-cloud/site-header.html',
    homeLoginTemplate: 'views/home/squ-student-cloud/login.html'
  });
