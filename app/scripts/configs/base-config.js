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
    facebookClientId: 'facebook client id',

    pageSizes: [5, 10, 20, 50],
    pageSize: 10,
    serviceIcon: 'static/images/icons/icon_openstack_small.png',
    dashboardEventsCacheTime: 60, // seconds
    listControlPanelShow: false,
    showImport: false,
    defaultErrorMessage: 'Reason unknown, please contact support',

    // build version
    buildId: 'develop',

    currency: '€',

    offerings: [
      {
        label: "Virtual machines",
        icon: "fa-desktop",
        feature: "vms",
        key: "vms",
        state: "appstore.vms",
        description: "OpenStack instances and DigitalOcean droplets."
      },
      {
        label: "Private clouds",
        icon: "fa-cloud",
        feature: "private_clouds",
        key: "private_clouds",
        state: "appstore.private_clouds",
        description: "OpenStack tenants and Amazon VPC.",
        requireOwnerOrStaff: true
      },
      {
        label: "Storage",
        icon: "fa-hdd-o",
        feature: "storage",
        key: "storages",
        state: "appstore.storages",
        description: "Block devices, object store spaces and other persistency services."
      },
      {
        label: "Applications",
        icon: "fa-database",
        feature: "apps",
        key: "apps",
        state: "appstore.apps",
        description: "Oracle database and SugarCRM."
      },
      {
        label: "Support",
        icon: "fa-wrench",
        key: "support",
        feature: "premiumSupport",
        state: "appstore.premiumSupport",
        description: "Premium support service."
      },
    ],

    offeringCategories: [
      {
        label: 'IaaS',
        items: ['private_clouds', 'vms', 'storages', 'support']
      },
    ],

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
        services: ['DigitalOcean', 'Azure', 'Amazon', 'OpenStackTenant']
      },
      {
        name: 'Private clouds',
        type: 'provider',
        icon: 'cloud',
        key: 'private_clouds',
        services: ['OpenStack'],
        requireOwnerOrStaff: true
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
        services: ['OpenStackTenant'],
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
        "OpenStackTenant.Instance": "vms",
        "OpenStackTenant.Volume": "storages",
        "OpenStackTenant.Snapshot": "storages",
        "GitLab.Group": "apps",
        "Zabbix.Host": "apps",
        "Zabbix.ITService": "apps",
        "OpenStack.Volume": "storages",
        "OpenStack.Snapshot": "storages"
    },
    showCompare: [
      'Virtual machines'
    ],
    defaultListCacheTime: 60 * 10,
    optionsCacheTime: 10 * 1000,
    toBeFeatures: [
      'resources',
      'support',
      'monitoring',
      'users',
      'invoices',
      'payments',
      'premiumSupport',
      'notifications',
      'sizing',
      'alerts'
    ],
    authenticationMethods: [
      'LOCAL_SIGNIN',
      'LOCAL_SIGNUP',
      'SOCIAL_SIGNUP',
      'ESTONIAN_ID'
    ],
    resourcesTypes: {
      vms: 'vms',
      applications: 'apps',
      privateClouds: 'private_clouds'
    },
    featuresVisible: false,

    requestTimeout: 1000 * 20,
    countsCacheTime: 60, // seconds
    enablePurchaseCostDisplay: true,

    resourcesTimerInterval: 7, // seconds
    countersTimerInterval: 7, // seconds
    providersTimerInterval: 7, // seconds

    ownerCanManageCustomer: true,

    roles: {
      owner: 'Organization owner',
      manager: 'Project manager',
      admin: 'System administrator'
    },
    invitationRedirectTime: 5000,
    invitationsEnabled: true,
    allowSignupWithoutInvitation: true,
    userMandatoryFields: [
      'full_name',
      'email'
    ],

    // Either 'accounting' or 'billing'
    accountingMode: 'accounting'
});
