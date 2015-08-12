'use strict';

angular.module('ncsaas')
  .constant('ENV', {
    // general config
    name: '',
    apiEndpoint: 'http://localhost:8080/',

    // auth config
    googleClientId: 'google client id',
    googleEndpointUrl: 'api-auth/google/',
    facebookClientId: 'facebook client id',
    facebookEndpointUrl: 'api-auth/facebook/',
    pageSizes: [5, 10, 20, 50],
    pageSize: 10,
    topMenuCustomersCount: 50,
    serviceIcon: '/static/images/icons/icon_openstack_small.png',
    defaultCustomerIcon: '/static/images/logo.png',
    topMenuCustomersCacheTime: 60 * 10, // seconds
    topMenuProjectsCacheTime: 60 * 10, // seconds
    dashboardEventsCacheTime: 60, // seconds
    listControlPanelShow: false,
    currentCustomerUuidStorageKey: 'currentCustomerUuid',
    currentProjectUuidStorageKey: 'currentProjectUuid',
    showImport: false,
    resourceOfflineStatus: 'Offline',
    resourceOnlineStatus: 'Online',

    // build version
    buildId: 'develop',

    addonsList : [
      {
        name: 'Bronze support',
        description: 'Phone assistance during working hours'
      },
      {
        name: 'Golden support',
        description: 'Phone assistance 24/7'
      },
      {
        name: 'Backup',
        options: ['Daily', 'Weekly']
      }
    ],
    appStoreCategories: [
      {
        name: 'VMs',
        type: 'provider',
        services: ['DigitalOcean', 'OpenStack']
      },
      {
        name: 'APPLICATIONS',
        type: 'provider',
        services: ['Oracle', 'GitLab']
      },
      {
        name: 'SUPPORT',
        type: 'package',
        packages: [
          {name: 'Support package A', type: 'low SLA level'},
          {name: 'Support package B', type: 'medium SLA level'},
          {name: 'Support package C', type: 'high SLA level'}
        ]
      }
    ],
    IntercomAppId: 'xfbbcxck',
    defaultListCacheTime: 60 * 10

  });
