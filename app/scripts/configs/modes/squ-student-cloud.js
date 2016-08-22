'use strict';

angular.module('ncsaas')
  .constant('MODE', {
    modeName: 'modeSquStudentCloud',
    toBeFeatures: [
      'monitoring',
      'password',
      'services',
      'providers',
      'premiumSupport',
      'servicesadd',
      'import',
      'templates',
      'monitoring',
      'projectGroups',
      'plans',
      'compare',
      'socialSignup',
      'estonianId'
    ],
    featuresVisible: false,
    appStoreCategories: [
      {
        name: 'VMs',
        type: 'provider',
        icon: 'desktop',
        services: ['Azure']
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
    initialDataTemplate: 'views/initial-data/student-cloud/initial-data.html',
    enablePurchaseCostDisplay: false,
    VmProviderSettingsUuid: "Set UUID of a shared service setting for VMs",
    gitLabProviderSettingsUuid: "Set UUID of a shared service setting for GitLab"
  });
