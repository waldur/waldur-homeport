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
  // Either 'accounting' or 'billing'
  accountingMode: 'accounting',

  defaultCategories: [
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
      label: gettext('Batch processing'),
      icon: 'fa-tasks',
      key: 'slurm',
      feature: 'slurm',
      state: 'appstore.slurm',
      description: gettext('Create an allocation for computations in batch resources.')
    },
  ],

  defaultGroup: gettext('Infrastructure'),

  resourcesTypes: {
    vms: 'vms',
    storages: 'storages',
    private_clouds: 'private_clouds',
    slurm: 'slurm'
  },

  // Index of category inside of appStoreCategories
  AllResources: -1,
  VirtualMachines: 0,
  PrivateClouds: 1,
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
      name: gettext('Storages'),
      type: 'provider',
      key: 'storages',
      services: ['OpenStackTenant'],
    },
    {
      name: gettext('Batch processing'),
      type: 'provider',
      key: 'slurm',
      services: ['SLURM'],
    },
  ],
  serviceCategories: [
    {
      name: gettext('Virtual machines'),
      services: ['Amazon', 'Azure', 'DigitalOcean', 'OpenStackTenant'],
    },
    {
      name: gettext('Service desk'),
      services: ['JIRA'],
    }
  ],

  // optional list of disabled services, for example, ['Amazon', 'Azure']
  disabledServices: [],

  resourceCategory: {
    'Amazon.Instance': 'vms',
    'Azure.VirtualMachine': 'vms',
    'DigitalOcean.Droplet': 'vms',
    'OpenStack.Instance': 'vms',
    'OpenStack.Tenant': 'private_clouds',
    'OpenStackTenant.Instance': 'vms',
    'OpenStackTenant.Volume': 'storages',
    'OpenStackTenant.Snapshot': 'storages',
    'Zabbix.Host': 'apps',
    'Zabbix.ITService': 'apps',
    'OpenStack.Volume': 'storages',
    'OpenStack.Snapshot': 'storages',
    'SLURM.Allocation': 'slurm',
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
    'SAML2',
    'VALIMO'
  ],
  VALIMO_LABEL: 'Mobile ID',
  SAML2_IDENTITY_PROVIDER: 'https://reos.taat.edu.ee/saml2/idp/metadata.php',
  SAML2_LABEL: 'TAAT',
  allowToSelectSAML2Provider: true,
  estoniaIdLogoutUrl: 'https://openid.ee/auth/logout',
  featuresVisible: false,

  requestTimeout: 1000 * 20,
  countsCacheTime: 60, // seconds
  enablePurchaseCostDisplay: true,

  resourceDetailInterval: 5, // seconds
  resourcesTimerInterval: 30, // seconds
  countersTimerInterval: 30, // seconds

  // an interval in milliseconds to check invitation if server returns 500 or there is a network error.
  invitationCheckInterval: 5000,

  // refresh timeout for a single resource polling.
  resourcePollingEnabled: true,
  singleResourcePollingTimeout: 1000 * 2,

  ownerCanManageCustomer: false,
  OWNERS_CAN_MANAGE_OWNERS: true,
  MANAGER_CAN_MANAGE_TENANTS: false,
  VALIDATE_INVITATION_EMAIL: false,

  // delay in milliseconds before starting intro js hints. It is recommended to set it bigger than 500.
  introJsDelay: 1000,

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

  userRegistrationHiddenFields: [
    'registration_method',
    'job_title',
    'phone_number',
    'organization'
  ],

  languageChoices: [
    {
      code: 'en',
      label: gettext('English')
    },
    {
      code: 'et',
      label: gettext('Estonian')
    },
    {
      code: 'lv',
      label: gettext('Latvian')
    },
    {
      code: 'lt',
      label: gettext('Lithuanian')
    },
    {
      code: 'ru',
      label: gettext('Russian')
    }
  ],
  defaultLanguage: 'en',
  tenantCredentialsVisible: true,
  organizationSubnetsVisible: false,

  FREEIPA_USERNAME_PREFIX: 'waldur_',

  // Support email and phone is rendered at the footer
  // supportEmail: 'support@example.com',
  // supportPhone: '+1234567890'

  // Renders label and logo at the login page
  // poweredByLogo: 'images/waldur/logo-120x120.png'

  // Renders link to docs in header
  // docsLink: 'http://example.com/docs/'

  // Conceal "Change request" from a selection of issue types for non-staff/non-support users
  // concealChangeRequest: false

  // Start intro.js implicitly. If false, intro.js is started
  // only when user clicks on "Guide Me" button
  introJsAutostart: false,
};

export default ENV;
