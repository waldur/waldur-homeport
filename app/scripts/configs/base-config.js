'use strict';

angular.module('ncsaas')
  .constant('ENV', {
    // general config
    name: '',
    apiEndpoint: 'http://localhost:8080/',
    modePageTitle: 'Waldur | Cloud Service Management',
    shortPageTitle: 'Waldur',

    // Social login config
    googleClientId: 'google client id',
    googleEndpointUrl: 'api-auth/google/',
    facebookClientId: 'facebook client id',
    facebookEndpointUrl: 'api-auth/facebook/',

    // JIRA config
    supportProjectUUID: 'support project UUID',

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

    currency: '€',

    offerings: [
      {
        label: "IT Transformation Service",
        description: "Hosting in highly secured data center.",
        key: "transformation",
        icon: "fa-building",
        category: "turnkey",
        state: "appstore.offering"
      },
      {
        label: "Devops-as-a-Service platform",
        description: "Enforce best-practices of application delivery.",
        key: "devops",
        icon: "fa-gears",
        category: "turnkey",
        state: "appstore.offering"
      },
      {
        label: "Disaster Recovery site",
        description: "Planning for business continuity under all conditions.",
        key: "recovery",
        icon: "fa-get-pocket",
        category: "turnkey",
        state: "appstore.offering"
      },
      {
        label: "Managed applications",
        description: "Full monitoring and application support",
        key: "managed_apps",
        icon: "fa-gears",
        category: "turnkey",
        state: "appstore.offering"
      },
      {
        label: "Virtual machines",
        icon: "fa-desktop",
        feature: "vms",
        category: "component",
        key: "vms",
        state: "appstore.store",
        description: "OpenStack Instances and DigitalOcean Droplets."
      },
      {
        label: "Private clouds",
        icon: "fa-cloud",
        feature: "private_clouds",
        category: "component",
        key: "private_clouds",
        state: "appstore.store",
        description: "OpenStack tenants and Amazon VPC."
      },
      {
        label: "Applications",
        icon: "fa-database",
        feature: "apps",
        category: "component",
        key: "apps",
        state: "appstore.store",
        description: "Oracle database and SugarCRM."
      },
      {
        label: "Support",
        icon: "fa-wrench",
        key: "support",
        feature: "premiumSupport",
        category: "component",
        state: "appstore.store",
        description: "Premium support service."
      }
    ],

    offeringCategories: [
      {
        label: 'Turnkey solutions',
        key: 'turnkey'
      },
      {
        label: 'Component offerings',
        key: 'component'
      }
    ],

    appStoreLimitChoices: 10,

    // Index of category inside of appStoreCategories
    AllResources: -1,
    VirtualMachines: 0,
    PrivateClouds: 1,
    Applications: 2,
    Storages: 3,

    appStoreCategories: [
      {
        name: 'Virtual machines',
        type: 'provider',
        icon: 'desktop',
        key: 'vms',
        services: ['DigitalOcean', 'Azure', 'Amazon', 'OpenStack']
      },
      {
        name: 'Private clouds',
        type: 'provider',
        icon: 'cloud',
        key: 'private_clouds',
        services: ['OpenStack']
      },
      {
        name: 'Applications',
        icon: 'database',
        type: 'provider',
        key: 'apps',
        services: ['Oracle', 'GitLab']
      },
      {
        name: 'Storages',
        type: 'provider',
        key: 'storages',
        services: ['OpenStack'],
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
    futureCategories: [],
    resourceCategory: {
        "Amazon.Instance": "vms",
        "SaltStack.SharepointTenant": "apps",
        "GitLab.Project": "apps",
        "SugarCRM.CRM": "apps",
        "Azure.VirtualMachine": "vms",
        "IaaS.Instance": "vms",
        "JIRA.Project": "apps",
        "DigitalOcean.Droplet": "vms",
        "OpenStack.Instance": "vms",
        "SaltStack.ExchangeTenant": "apps",
        "OpenStack.Tenant": "private_clouds",
        "GitLab.Group": "apps",
        "Zabbix.Host": "apps",
        "Zabbix.ITService": "apps",
        "OpenStack.Volume": "storages"
    },
    showCompare: [
      'Virtual machines'
    ],
    IntercomAppId: 'xfbbcxck',
    defaultListCacheTime: 60 * 10,
    optionsCacheTime: 10 * 1000,
    dashboardHelp: {
      alertsList: {
        type: 'alertsList',
        name: 'alerts',
        title: 'Alerts'
      },
      eventsList: {
        type: 'eventsList',
        name: 'events',
        title: 'Events'
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
        key: 'Azure',
        name: 'Azure provider',
        link: null
      },
      {
        type: 'providers',
        key: 'Amazon',
        name: 'Amazon EC2 provider',
        link: 'http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html'
      },
      {
        type: 'providers',
        key: 'DigitalOcean',
        name: 'DigitalOcean provider',
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
      'templates',
      'invoices',
      'payments',
      'services:provider:uuid',
      'password',
      'premiumSupport',
      'localSignup',
      'notifications',
      'sizing',
      'alerts',
    ],
    resourcesTypes: {
      vms: 'vms',
      applications: 'apps',
      privateClouds: 'private_clouds'
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
      'project-create': 'project',
      'appstore.store':  'resource',
      'import.import':   'resource'
    },

    resourcesTimerInterval: 7, // seconds
    countersTimerInterval: 7, // seconds
    providersTimerInterval: 7, // seconds

    resourceStateColorClasses: {
      'OK': 'online',
      'Creation Scheduled': 'processing',
      'Creating': 'processing',
      'Update Scheduled': 'processing',
      'Updating': 'processing',
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
      'OK': 'online',
      'Erred': 'erred',
      'In Sync': 'online',
      'Creation Scheduled': 'processing',
      'Creating': 'processing',
      'Update Scheduled': 'processing',
      'Updating': 'processing',
      'Deletion Scheduled': 'processing',
      'Deleting': 'processing'
    },
    ownerCanManageCustomer: true,

    roles: {
      owner: 'Organization owner',
      manager: 'Project manager',
      admin: 'System administrator'
    },
    invitationStorageToken: 'ncInvitationToken',
    invitationRedirectTime: 5000,
    invitationsEnabled: true
  });
