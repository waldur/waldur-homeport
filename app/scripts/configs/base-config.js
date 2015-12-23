'use strict';

angular.module('ncsaas')
  .constant('ENV', {
    // general config
    name: '',
    apiEndpoint: 'http://localhost:8080/',
    modePageTitle: 'NodeConductor - Cloud Service Management',

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
    dashboardHelp: {
      alertsList: {
        type: 'alertsList',
        name: 'alerts',
        title: 'Alerts messages on dashboard, resource and customer details pages'
      }
    },
    profileHelp: {
      sshKeys: {
        type: 'sshKeys',
        name: 'keys',
        title: 'How to generate SSH key'
      }
    },
    helpList: [
      {
        type: 'providers',
        name: 'Azure',
        link: null
      },
      {
        type: 'providers',
        name: 'Amazon',
        link: 'http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html'
      },
      {
        type: 'providers',
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

    nonChargeableAppStoreOptions: [
      'ssh_public_key',
      'region',
      'visibility_level',
      'group',
      'security_groups'
    ],

    requestTimeout: 1000 * 20,
    countsCacheTime: 60, // seconds
    enablePurchaseCostDisplay: true,
    entityCreateLink: {
      'services.create': 'service',
      'projects.create': 'project',
      'appstore.store':  'resource',
      'import.import':   'resource'
    },

    resourcesTimerInterval: 7, // seconds
    countersTimerInterval: 7, // seconds
    providersTimerInterval: 7, // seconds

    resourceStateColorClasses: {
      'Online': 'online',
      'Offline': 'offline',
      'Erred': 'erred',
      'Starting Scheduled': 'processing',
      'Stopping Scheduled': 'processing',
      'Restarting Scheduled': 'processing',
      'Starting': 'processing',
      'Stopping': 'processing',
      'Restarting': 'processing',
      'Provisioning Scheduled': 'processing',
      'Provisioning': 'processing',
      'Deletion Scheduled': 'processing',
      'Deleting': 'processing',
      'Resizing Scheduled': 'processing',
      'Resizing': 'processing'
    },

    servicesStateColorClasses: {
      'Erred': 'erred',
      'In Sync': 'online',
      'Creation Scheduled': 'processing',
      'Creating': 'processing',
      'Sync Scheduled': 'processing',
      'Syncing': 'processing'
    }
  });
