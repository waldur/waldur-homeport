const ENV = {
  // general config
  name: '',
  apiEndpoint: 'http://localhost:8080/',
  modePageTitle: 'Waldur | Cloud Service Management',
  shortPageTitle: 'Waldur',

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
    volumes: 'volumes',
    private_clouds: 'private_clouds',
    slurm: 'slurm',
    jiraProject: 'jiraProject',
  },

  // Index of category inside of appStoreCategories
  AllResources: -1,
  VirtualMachines: 0,
  PrivateClouds: 1,
  Storages: 3,
  Volumes: 4,

  appStoreCategories: [
    {
      name: gettext('Virtual machines'),
      type: 'provider',
      icon: 'desktop',
      key: 'vms',
      services: ['DigitalOcean', 'Azure', 'Amazon', 'OpenStackTenant', 'Rijkscloud']
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
      services: ['OpenStackTenant', 'Rijkscloud'],
    },
    {
      name: gettext('Volumes'),
      type: 'provider',
      key: 'volumes',
      services: ['OpenStackTenant', 'Rijkscloud'],
    },
    {
      name: gettext('Batch processing'),
      type: 'provider',
      key: 'slurm',
      services: ['SLURM'],
    },
    {
      name: gettext('Service desk'),
      type: 'provider',
      key: 'jiraProject',
      services: ['JIRA'],
    },
  ],
  serviceCategories: [
    {
      name: gettext('Virtual machines'),
      services: ['Amazon', 'Azure', 'DigitalOcean', 'OpenStackTenant', 'Rijkscloud'],
    },
    {
      name: gettext('Service desk'),
      services: ['JIRA'],
    },
    {
      name: gettext('Batch processing'),
      services: ['SLURM'],
    }
  ],

  // optional list of disabled services, for example, ['Amazon', 'Azure']
  disabledServices: [],

  resourceCategory: {
    'Amazon.Instance': 'vms',
    'Azure.VirtualMachine': 'vms',
    'DigitalOcean.Droplet': 'vms',
    'OpenStack.Tenant': 'private_clouds',
    'OpenStackTenant.Instance': 'vms',
    'OpenStackTenant.Volume': 'storages',
    'OpenStackTenant.Snapshot': 'storages',
    'Zabbix.Host': 'apps',
    'Zabbix.ITService': 'apps',
    'SLURM.Allocation': 'slurm',
    'JIRA.Project': 'jiraProject',
    'JIRA.Issue': 'jiraProject',
    'Rijkscloud.Instance': 'vms',
    'Rijkscloud.Volume': 'storages',
  },
  defaultListCacheTime: 60 * 10,
  optionsCacheTime: 10 * 1000,
  disabledFeatures: [],
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

  onlyStaffManagesServices: false,
  ownerCanManageCustomer: false,
  OWNERS_CAN_MANAGE_OWNERS: true,
  MANAGER_CAN_MANAGE_TENANTS: false,

  // delay in milliseconds before starting intro js hints. It is recommended to set it bigger than 500.
  introJsDelay: 1000,

  roles: {
    owner: gettext('Organization owner'),
    manager: gettext('Project manager'),
    admin: gettext('System administrator')
  },
  invitationRedirectTime: 5000,
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
      code: 'az',
      label: gettext('Azerbaijani')
    },
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

  // Provide exclude file types for issue attachments uploading
  // Based on https://github.com/okonet/attr-accept
  // Reffered to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#Attributes
  // Available value types: string or string array
  // Available value format:
  // A file extension starting with the STOP character (U+002E). (e.g. .jpg, .png, .doc).
  // A valid MIME type with no extensions.
  // audio/* representing sound files.
  // video/* representing video files.
  // image/* representing image files.
  excludedAttachmentTypes : [],

  // Ensure that customer, project and resource name contains only ASCII chars
  enforceLatinName: true,
};

export default ENV;
