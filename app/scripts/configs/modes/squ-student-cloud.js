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
      'projectGroups',
      'plans'
    ],
    featuresVisible: false,
    appStoreCategories: [
      {
        name: 'VMs',
        type: 'provider',
        icon: 'desktop',
        services: ['OpenStack']
      },
      {
        name: 'APPLICATIONS',
        type: 'provider',
        icon: 'database',
        services: ['GitLab']
      }
    ],
    emailMask: 'squ.edu.om',
    serviceCategories: [],
    homeTemplate: 'views/home/squ-student-cloud/home.html',
    homeHeaderTemplate: 'views/partials/squ-student-cloud/site-header.html',
    homeLoginTemplate: 'views/home/squ-student-cloud/login.html',
    enablePurchaseCostDisplay: false,
    VmProviderSettingsUuid: "1cbefddebe97488788d92e7c511f1808",
    gitLabProviderSettingsUuid: "6b32f48bc48c4ce98b4025381ba94548"
  });
