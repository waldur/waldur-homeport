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

    currency: '$',

    // Index of category inside of appStoreCategories
    AllResources: -1,
    VirtualMachines: 0,
    Applications: 1,

    appStoreCategories: [
      {
        name: 'VMs',
        type: 'provider',
        icon: 'desktop',
        services: ['DigitalOcean', 'OpenStack', 'Azure', 'Amazon']
      },
      {
        name: 'APPLICATIONS',
        icon: 'database',
        type: 'provider',
        services: ['Oracle', 'GitLab']
      }
    ],
    serviceCategories: [
      {
        name: 'Virtual machines',
        services: ['Amazon', 'Azure', 'DigitalOcean', 'OpenStack'],
      },
      {
        name: 'Applications',
        services: ['Oracle', 'GitLab']
      }
    ],
    IntercomAppId: 'xfbbcxck',
    defaultListCacheTime: 60 * 10,
    helpList: [
      {
        name: 'Azure',
        link: null
      },
      {
        name: 'Amazon',
        link: 'http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html'
      },
      {
        name: 'DigitalOcean',
        link: 'https://www.digitalocean.com/community/tutorials/how-to-use-the-digitalocean-api-v2'
      }
    ],
    toBeFeatures: [
      'openStackPrivateCloud',
      'resources',
      'pricelistsCompare',
      'prePaid',
      'support',
      'monitoring',
      'users',
      'backups',
      'templates',
      'invoices',
      'payments',
      'services:provider:uuid',
      'password',
      'premiumSupport',
      'localSignup'
    ],
    resourcesTypes: {
      vms: 'vms',
      applications: 'applications'
    },
    featuresVisible: false,

    projectServiceLinkEndpoints: {
      Oracle: 'oracle-service-project-link',
      OpenStack: 'openstack-service-project-link',
      IaaS: 'project-cloud-memberships',
      GitLab: 'gitlab-service-project-link',
      DigitalOcean: 'digitalocean-service-project-link',
      Amazon: 'aws-service-project-link'
    },

    requestTimeout: 1000 * 10,
    countsCacheTime: 60, // seconds
    enablePurchaseCostDisplay: true,
    entityCreateLink: {
      'services.create': 'service',
      'projects.create': 'project',
      'appstore.store':  'resource',
      'import.import':   'resource'
    },

    resourcesTimerInterval: 700, // seconds

    resourceStateColorClasses: {
      'Online': 'online',
      'Offline': 'offline',
      'Erred': 'erred',
      'Starting Scheduled': 'starting',
      'Stopping Scheduled': 'stopping',
      'Restarting Scheduled': 'restarting',
      'Starting': 'starting',
      'Stopping': 'stopping',
      'Restarting': 'restarting'
    },

  });
