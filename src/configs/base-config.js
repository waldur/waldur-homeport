const ENV = {
  // general config
  name: '',
  apiEndpoint: 'http://localhost:8080/',
  modePageTitle: 'Waldur | Cloud Service Management',
  shortPageTitle: 'Waldur',

  pageSizes: [5, 10, 20, 50],
  pageSize: 10,
  defaultErrorMessage: gettext('Reason unknown, please contact support.'),

  // build version
  buildId: 'develop',

  currency: '€',
  // Either 'accounting' or 'billing'
  accountingMode: 'accounting',

  defaultListCacheTime: 60 * 10,
  optionsCacheTime: 10 * 1000,
  disabledFeatures: [],
  enabledFeatures: [
    'billing',
    'customers',
    'eventlog',
    'import',
    'marketplace',
    'marketplace.my-offerings',
    'notifications',
    'offering.comments',
    'private_clouds',
    'projects',
    'projectCostDetails',
    'resources',
    'storage',
    'support',
    'support.users',
    'support.organizations',
    'support.resources-treemap',
    'support.shared-providers',
    'team',
    'user.ssh-keys',
    'vms',
  ],
  featuresVisible: false,

  requestTimeout: 1000 * 20,
  countsCacheTime: 60, // seconds
  enablePurchaseCostDisplay: true,

  resourceDetailInterval: 5, // seconds
  resourcesTimerInterval: 30, // seconds
  countersTimerInterval: 30, // seconds

  // Allows to provide help text for the civil code field in invitation form
  invitationCivilCodeHelpText: gettext(
    'Must start with a country prefix ie EE34501234215',
  ),

  // an interval in milliseconds to check invitation if server returns 500 or there is a network error.
  invitationCheckInterval: 5000,

  // refresh timeout for a single resource polling.
  resourcePollingEnabled: true,
  singleResourcePollingTimeout: 1000 * 2,

  // delay in milliseconds before starting intro js hints. It is recommended to set it bigger than 500.
  introJsDelay: 1000,

  roles: {
    owner: gettext('Organization owner'),
    manager: gettext('Project manager'),
    admin: gettext('System administrator'),
  },
  invitationRedirectTime: 5000,
  userMandatoryFields: ['full_name', 'email'],

  userRegistrationHiddenFields: [
    'registration_method',
    'job_title',
    'phone_number',
    'organization',
  ],

  languageChoices: [
    {
      code: 'az',
      label: gettext('Azerbaijani'),
    },
    {
      code: 'en',
      label: gettext('English'),
    },
    {
      code: 'et',
      label: gettext('Estonian'),
    },
    {
      code: 'lv',
      label: gettext('Latvian'),
    },
    {
      code: 'lt',
      label: gettext('Lithuanian'),
    },
    {
      code: 'ru',
      label: gettext('Russian'),
    },
  ],
  defaultLanguage: 'en',
  organizationSubnetsVisible: false,

  FREEIPA_USERNAME_PREFIX: 'waldur_',

  // Support email and phone is rendered at the footer
  // supportEmail: 'support@example.com',
  // supportPhone: '+1234567890'

  // Support portal URL is rendered as a shortcut on dashboard
  // supportPortalURL: 'http://example.com/support/',

  // Renders label and logo at the login page
  // poweredByLogo: 'images/waldur/logo-120x120.png'

  // Renders link to docs in header
  // docsLink: 'http://example.com/docs/'

  // Render external links in dropdown in header
  // Each item should be object with label and url fields.
  // For example:
  // {label: 'Helpdesk', url: 'https://example.com/'}
  externalLinks: [],

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
  excludedAttachmentTypes: [],

  // Ensure that customer, project and resource name contains only ASCII chars.
  enforceLatinName: true,

  // It can be either 'localStorage' or 'sessionStorage'.
  authStorage: 'localStorage',

  // Allows to hide billing step in organization creation wizard
  hideOrganizationBillingStep: false,

  // Allows to hide domain field in organization detail
  organizationDomainVisible: false,

  // Default font for rendering exported table PDF
  defaultFont: 'OpenSans',

  // Font families should match default font.
  // Both normal and bold types are required.
  fontFamilies: {
    OpenSans: {
      normal: 'OpenSans-Regular.ttf',
      bold: 'OpenSans-Bold.ttf',
    },
  },
};

export default ENV;
