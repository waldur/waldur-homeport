const ENV = {
  // general config
  name: '',
  apiEndpoint: 'http://localhost:8080/',
  modePageTitle: 'Waldur | Cloud Service Management',
  shortPageTitle: 'Waldur',

  // Social login config
  // googleClientId: 'CHANGE_ME_TO_GOOGLE_SECRET',
  // facebookClientId: 'CHANGE_ME_TO_FACEBOOK_SECRET',
  // smartIdClientId: 'CHANGE_ME_TO_SMARTIDEE_SECRET',

  pageSizes: [5, 10, 20, 50],
  pageSize: 10,
  dashboardEventsCacheTime: 60, // seconds
  showImport: false,
  defaultErrorMessage: gettext('Reason unknown, please contact support.'),

  // build version
  buildId: 'develop',

  currency: '€',

  offerings: [
    {
      label: gettext('Virtual machines'),
      icon: 'fa-desktop',
      feature: 'vms',
      key: 'vms',
      state: 'appstore.vms',
      description: gettext('Provision virtual machines (VMs) in available Providers.')
    },
    {
      label: gettext('Private clouds'),
      icon: 'fa-cloud',
      feature: 'private_clouds',
      key: 'private_clouds',
      state: 'appstore.private_clouds',
      description: gettext('Purchase bulk resource as Virtual Private Clouds (VPC).'),
    },
    {
      label: gettext('Block storage'),
      icon: 'fa-hdd-o',
      feature: 'storage',
      key: 'storages',
      state: 'appstore.storages',
      description: gettext('Provision persistent storage volumes in available Providers.')
    },
    {
      label: gettext('Applications'),
      icon: 'fa-database',
      feature: 'apps',
      key: 'apps',
      state: 'appstore.apps',
      description: gettext('Oracle database and SugarCRM.')
    },
    {
      label: gettext('Support'),
      icon: 'fa-wrench',
      key: 'support',
      feature: 'premiumSupport',
      state: 'appstore.premiumSupport',
      description: gettext('Premium support service.')
    },
  ],

  offeringCategories: [
    {
      label: gettext('IaaS'),
      items: ['private_clouds', 'vms', 'storages', 'support']
    },
  ],

  resourcesTypes: {
    vms: 'vms',
    storages: 'storages',
    private_clouds: 'private_clouds'
  },

  // Index of category inside of appStoreCategories
  AllResources: -1,
  VirtualMachines: 0,
  PrivateClouds: 1,
  Applications: 2,
  Storages: 3,

  appStoreCategories: [
    {
      name: gettext('Virtual machines'),
      type: 'provider',
      icon: 'desktop',
      key: 'vms',
      services: ['DigitalOcean', 'Azure', 'Amazon', 'OpenStackTenant']
    },
    {
      name: gettext('Private clouds'),
      type: 'provider',
      icon: 'cloud',
      key: 'private_clouds',
      services: ['OpenStack'],
    },
    {
      name: gettext('Applications'),
      icon: 'database',
      type: 'provider',
      key: 'apps',
      services: ['Oracle', 'GitLab']
    },
    {
      name: gettext('Storages'),
      type: 'provider',
      key: 'storages',
      services: ['OpenStackTenant'],
    }
  ],
  serviceCategories: [
    {
      name: gettext('Virtual machines'),
      services: ['Amazon', 'Azure', 'DigitalOcean', 'OpenStack'],
    },
    {
      name: gettext('Applications'),
      services: ['Oracle', 'GitLab']
    }
  ],

  // optional list of disabled services, for example, ['Amazon', 'Azure']
  disabledServices: [],

  resourceCategory: {
    'Amazon.Instance': 'vms',
    'SaltStack.SharepointTenant': 'apps',
    'GitLab.Project': 'apps',
    'SugarCRM.CRM': 'apps',
    'Azure.VirtualMachine': 'vms',
    'IaaS.Instance': 'vms',
    'JIRA.Project': 'apps',
    'DigitalOcean.Droplet': 'vms',
    'OpenStack.Instance': 'vms',
    'SaltStack.ExchangeTenant': 'apps',
    'OpenStack.Tenant': 'private_clouds',
    'OpenStackTenant.Instance': 'vms',
    'OpenStackTenant.Volume': 'storages',
    'OpenStackTenant.Snapshot': 'storages',
    'GitLab.Group': 'apps',
    'Zabbix.Host': 'apps',
    'Zabbix.ITService': 'apps',
    'OpenStack.Volume': 'storages',
    'OpenStack.Snapshot': 'storages'
  },
  showCompare: [
    'Virtual machines'
  ],
  defaultListCacheTime: 60 * 10,
  optionsCacheTime: 10 * 1000,
  disabledFeatures: [],
  authenticationMethods: [
    'LOCAL_SIGNIN',
    'LOCAL_SIGNUP',
    'SOCIAL_SIGNUP',
    'ESTONIAN_ID',
    'SAML2'
  ],
  SAML2_IDENTITY_PROVIDER: 'https://reos.taat.edu.ee/saml2/idp/metadata.php',
  SAML2_LABEL: 'TAAT',
  estoniaIdLogoutUrl: 'https://openid.ee/auth/logout',
  featuresVisible: false,

  requestTimeout: 1000 * 20,
  countsCacheTime: 60, // seconds
  enablePurchaseCostDisplay: true,

  resourcesTimerInterval: 30, // seconds
  countersTimerInterval: 30, // seconds

  // refresh timeout for a single resource polling.
  resourcePollingEnabled: true,
  singleResourcePollingTimeout: 1000 * 2,

  ownerCanManageCustomer: true,
  ownerCanUpdateCustomerPolicies: true,
  OWNERS_CAN_MANAGE_OWNERS: true,
  MANAGER_CAN_MANAGE_TENANTS: false,

  roles: {
    owner: gettext('Organization owner'),
    manager: gettext('Project manager'),
    admin: gettext('System administrator')
  },
  invitationRedirectTime: 5000,
  invitationsEnabled: true,
  allowSignupWithoutInvitation: true,
  userMandatoryFields: [
    'full_name',
    'email'
  ],

  // Either 'accounting' or 'billing'
  accountingMode: 'accounting',

  languageChoices: [
    {
      code: 'en',
      label: gettext('English')
    },
    {
      code: 'et',
      label: gettext('Estonian')
    }
  ],
  defaultLanguage: 'en',
  tenantCredentialsVisible: true,

  // Support email and phone is rendered at the footer
  // supportEmail: 'support@example.com',
  // supportPhone: '+1234567890'

  // Renders label and logo at the login page
  // poweredByLogo: 'static/images/logo.png'

  // Renders link to docs in header
  // docsLink: 'http://example.com/docs/'

  // Conceal "Change request" from a selection of issue types for non-staff/non-support users
  // concealChangeRequest: false
};

export default ENV;
