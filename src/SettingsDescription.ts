/* eslint-disable prettier/prettier */
// WARNING: This file is auto-generated from src/waldur_core/core/management/commands/print_settings_description.py
// Do not edit it manually. All manual changes would be overridden.
import { translate } from '@waldur/i18n';

export const SettingsDescription = [
  {
    description: translate('Branding'),
    items: [
      {
        key: 'SITE_NAME',
        description: translate('Human-friendly name of the Waldur deployment.'),
        default: 'Waldur',
        type: 'string',
      },
      {
        key: 'SHORT_PAGE_TITLE',
        description: translate('It is used as prefix for page title.'),
        default: 'Waldur',
        type: 'string',
      },
      {
        key: 'FULL_PAGE_TITLE',
        description: translate('It is used as default page title if it\'s not specified explicitly.'),
        default: 'Waldur | Cloud Service Management',
        type: 'string',
      },
      {
        key: 'SITE_DESCRIPTION',
        description: translate('Description of the Waldur deployment.'),
        default: 'Your single pane of control for managing projects, teams and resources in a self-service manner.',
        type: 'string',
      },
    ],
  },
  {
    description: translate('Marketplace'),
    items: [
      {
        key: 'SITE_ADDRESS',
        description: translate('It is used in marketplace order header.'),
        default: '',
        type: 'string',
      },
      {
        key: 'SITE_EMAIL',
        description: translate('It is used in marketplace order header and UI footer.'),
        default: '',
        type: 'string',
      },
      {
        key: 'SITE_PHONE',
        description: translate('It is used in marketplace order header and UI footer.'),
        default: '',
        type: 'string',
      },
      {
        key: 'CURRENCY_NAME',
        description: translate('It is used in marketplace order details and invoices for currency formatting.'),
        default: 'EUR',
        type: 'string',
      },
    ],
  },
  {
    description: translate('Notifications'),
    items: [
      {
        key: 'COMMON_FOOTER_TEXT',
        description: translate('Common footer in txt format for all emails.'),
        default: '',
        type: 'text_field',
      },
      {
        key: 'COMMON_FOOTER_HTML',
        description: translate('Common footer in html format for all emails.'),
        default: '',
        type: 'html_field',
      },
    ],
  },
  {
    description: translate('Links'),
    items: [
      {
        key: 'DOCS_URL',
        description: translate('Renders link to docs in header'),
        default: '',
        type: 'url_field',
      },
      {
        key: 'HERO_LINK_LABEL',
        description: translate('Label for link in hero section of HomePort landing page. It can be lead to support site or blog post.'),
        default: '',
        type: 'string',
      },
      {
        key: 'HERO_LINK_URL',
        description: translate('Link URL in hero section of HomePort landing page.'),
        default: '',
        type: 'url_field',
      },
      {
        key: 'SUPPORT_PORTAL_URL',
        description: translate('Link URL to support portal. Rendered as a shortcut on dashboard'),
        default: '',
        type: 'url_field',
      },
    ],
  },
  {
    description: translate('Theme'),
    items: [
      {
        key: 'SIDEBAR_STYLE',
        description: translate('Style of sidebar. Possible values: dark, light, accent.'),
        default: 'dark',
        type: 'string',
      },
      {
        key: 'BRAND_COLOR',
        description: translate('Hex color definition is used in HomePort landing page for login button.'),
        default: '#3a8500',
        type: 'color_field',
      },
      {
        key: 'BRAND_LABEL_COLOR',
        description: translate('Hex color definition is used in HomePort landing page for font color of login button.'),
        default: '#000000',
        type: 'color_field',
      },
      {
        key: 'DISABLE_DARK_THEME',
        description: translate('Toggler for dark theme.'),
        default: false,
        type: 'boolean',
      },
    ],
  },
  {
    description: translate('Images'),
    items: [
      {
        key: 'SITE_LOGO',
        description: translate('The image used in marketplace order header.'),
        default: '',
        type: 'image_field',
      },
      {
        key: 'SIDEBAR_LOGO',
        description: translate('The image rendered at the top of sidebar menu in HomePort.'),
        default: '',
        type: 'image_field',
      },
      {
        key: 'SIDEBAR_LOGO_MOBILE',
        description: translate('The image rendered at the top of mobile sidebar menu in HomePort.'),
        default: '',
        type: 'image_field',
      },
      {
        key: 'SIDEBAR_LOGO_DARK',
        description: translate('The image rendered at the top of sidebar menu in dark mode.'),
        default: '',
        type: 'image_field',
      },
      {
        key: 'POWERED_BY_LOGO',
        description: translate('The image rendered at the bottom of login menu in HomePort.'),
        default: '',
        type: 'image_field',
      },
      {
        key: 'HERO_IMAGE',
        description: translate('The image rendered at hero section of HomePort landing page.'),
        default: '',
        type: 'image_field',
      },
      {
        key: 'LOGIN_LOGO',
        description: translate('A custom .png image file for login page'),
        default: '',
        type: 'image_field',
      },
      {
        key: 'FAVICON',
        description: translate('A custom favicon .png image file'),
        default: '',
        type: 'image_field',
      },
      {
        key: 'OFFERING_LOGO_PLACEHOLDER',
        description: translate('Default logo for offering'),
        default: '',
        type: 'image_field',
      },
    ],
  },
  {
    description: translate('Service desk integration settings'),
    items: [
      {
        key: 'WALDUR_SUPPORT_ENABLED',
        description: translate('Toggler for support plugin.'),
        default: true,
        type: 'boolean',
      },
      {
        key: 'WALDUR_SUPPORT_ACTIVE_BACKEND_TYPE',
        description: translate('Type of support backend. Possible values: atlassian, zammad, smax.'),
        default: 'atlassian',
        type: 'string',
      },
      {
        key: 'WALDUR_SUPPORT_DISPLAY_REQUEST_TYPE',
        description: translate('Toggler for request type displaying'),
        default: true,
        type: 'boolean',
      },
    ],
  },
  {
    description: translate('Atlassian settings'),
    items: [
      {
        key: 'ATLASSIAN_USE_OLD_API',
        description: translate('Toggler for legacy API usage.'),
        default: false,
        type: 'boolean',
      },
      {
        key: 'ATLASSIAN_USE_TEENAGE_API',
        description: translate('Toggler for teenage API usage.'),
        default: false,
        type: 'boolean',
      },
      {
        key: 'ATLASSIAN_USE_AUTOMATIC_REQUEST_MAPPING',
        description: translate('Toggler for automatic request mapping.'),
        default: true,
        type: 'boolean',
      },
      {
        key: 'ATLASSIAN_MAP_WALDUR_USERS_TO_SERVICEDESK_AGENTS',
        description: translate('Toggler for mapping between waldur user and service desk agents.'),
        default: false,
        type: 'boolean',
      },
      {
        key: 'ATLASSIAN_STRANGE_SETTING',
        description: translate('A constant in the API path, sometimes differs'),
        default: 1,
        type: 'integer',
      },
      {
        key: 'ATLASSIAN_API_URL',
        description: translate('Atlassian API server URL'),
        default: 'http://example.com/',
        type: 'url_field',
      },
      {
        key: 'ATLASSIAN_USERNAME',
        description: translate('Username for access user'),
        default: 'USERNAME',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_PASSWORD',
        description: translate('Password for access user'),
        default: 'PASSWORD',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_EMAIL',
        description: translate('Email for access user'),
        default: '',
        type: 'email_field',
      },
      {
        key: 'ATLASSIAN_TOKEN',
        description: translate('Token for access user'),
        default: '',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_VERIFY_SSL',
        description: translate('Toggler for SSL verification'),
        default: false,
        type: 'boolean',
      },
      {
        key: 'ATLASSIAN_PROJECT_ID',
        description: translate('Service desk ID or key'),
        default: '',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_DEFAULT_OFFERING_ISSUE_TYPE',
        description: translate('Issue type used for request-based item processing.'),
        default: 'Service Request',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_EXCLUDED_ATTACHMENT_TYPES',
        description: translate('Comma-separated list of file extenstions not allowed for attachment.'),
        default: '',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_PULL_PRIORITIES',
        description: translate('Toggler for pulling priorities from backend'),
        default: true,
        type: 'boolean',
      },
      {
        key: 'ATLASSIAN_ISSUE_TYPES',
        description: translate('Comma-separated list of enabled issue types. First type is the default one.'),
        default: 'Informational, Service Request, Change Request, Incident',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_AFFECTED_RESOURCE_FIELD',
        description: translate('Affected resource field name'),
        default: '',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_DESCRIPTION_TEMPLATE',
        description: translate('Template for issue description'),
        default: '',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_SUMMARY_TEMPLATE',
        description: translate('Template for issue summary'),
        default: '',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_IMPACT_FIELD',
        description: translate('Impact field name'),
        default: 'Impact',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_ORGANISATION_FIELD',
        description: translate('Organisation field name'),
        default: '',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_RESOLUTION_SLA_FIELD',
        description: translate('Resolution SLA field name'),
        default: '',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_PROJECT_FIELD',
        description: translate('Project field name'),
        default: '',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_REPORTER_FIELD',
        description: translate('Reporter field name'),
        default: 'Original Reporter',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_CALLER_FIELD',
        description: translate('Caller field name'),
        default: 'Caller',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_SLA_FIELD',
        description: translate('SLA field name'),
        default: 'Time to first response',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_LINKED_ISSUE_TYPE',
        description: translate('Type of linked issue field name'),
        default: 'Relates',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_SATISFACTION_FIELD',
        description: translate('Customer satisfaction field name'),
        default: 'Customer satisfaction',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_REQUEST_FEEDBACK_FIELD',
        description: translate('Request feedback field name'),
        default: 'Request feedback',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_TEMPLATE_FIELD',
        description: translate('Template field name'),
        default: '',
        type: 'string',
      },
      {
        key: 'ATLASSIAN_CUSTOM_ISSUE_FIELD_MAPPING_ENABLED',
        description: translate('Should extra issue field mappings be applied'),
        default: true,
        type: 'boolean',
      },
      {
        key: 'ATLASSIAN_SHARED_USERNAME',
        description: translate('Is Service Desk username the same as in Waldur'),
        default: false,
        type: 'boolean',
      },
    ],
  },
  {
    description: translate('Zammad settings'),
    items: [
      {
        key: 'ZAMMAD_API_URL',
        description: translate('Zammad API server URL. For example <http://localhost:8080/>'),
        default: '',
        type: 'url_field',
      },
      {
        key: 'ZAMMAD_TOKEN',
        description: translate('Authorization token.'),
        default: '',
        type: 'string',
      },
      {
        key: 'ZAMMAD_GROUP',
        description: translate('The name of the group to which the ticket will be added. If not specified, the first group will be used.'),
        default: '',
        type: 'string',
      },
      {
        key: 'ZAMMAD_ARTICLE_TYPE',
        description: translate('Type of a comment. Default is email because it allows support to reply to tickets directly in Zammad<https://docs.zammad.org/en/latest/api/ticket/articles.html#articles/>'),
        default: 'email',
        type: 'string',
      },
      {
        key: 'ZAMMAD_COMMENT_MARKER',
        description: translate('Marker for comment. Used for separating comments made via Waldur from natively added comments.'),
        default: 'Created by Waldur',
        type: 'string',
      },
      {
        key: 'ZAMMAD_COMMENT_PREFIX',
        description: translate('Comment prefix with user info.'),
        default: 'User: {name}',
        type: 'string',
      },
      {
        key: 'ZAMMAD_COMMENT_COOLDOWN_DURATION',
        description: translate('Time in minutes. Time in minutes while comment deletion is available <https://github.com/zammad/zammad/issues/2687/>, <https://github.com/zammad/zammad/issues/3086/>'),
        default: 5,
        type: 'integer',
      },
    ],
  },
  {
    description: translate('SMAX settings'),
    items: [
      {
        key: 'SMAX_API_URL',
        description: translate('SMAX API server URL. For example <http://localhost:8080/>'),
        default: '',
        type: 'url_field',
      },
      {
        key: 'SMAX_TENANT_ID',
        description: translate('User tenant ID.'),
        default: '',
        type: 'string',
      },
      {
        key: 'SMAX_LOGIN',
        description: translate('Authorization login.'),
        default: '',
        type: 'string',
      },
      {
        key: 'SMAX_PASSWORD',
        description: translate('Authorization password.'),
        default: '',
        type: 'string',
      },
      {
        key: 'SMAX_ORGANISATION_FIELD',
        description: translate('Organisation field name.'),
        default: '',
        type: 'string',
      },
      {
        key: 'SMAX_PROJECT_FIELD',
        description: translate('Project field name.'),
        default: '',
        type: 'string',
      },
      {
        key: 'SMAX_AFFECTED_RESOURCE_FIELD',
        description: translate('Resource field name.'),
        default: '',
        type: 'string',
      },
      {
        key: 'SMAX_REQUESTS_OFFERING',
        description: translate('Requests offering code for all issues.'),
        default: '',
        type: 'string',
      },
      {
        key: 'SMAX_SECONDS_TO_WAIT',
        description: translate('Duration in seconds of delay between pull user attempts.'),
        default: 1,
        type: 'integer',
      },
      {
        key: 'SMAX_TIMES_TO_PULL',
        description: translate('The maximum number of attempts to pull user from backend.'),
        default: 10,
        type: 'integer',
      },
      {
        key: 'SMAX_CREATION_SOURCE_NAME',
        description: translate('Creation source name.'),
        default: '',
        type: 'string',
      },
      {
        key: 'SMAX_VERIFY_SSL',
        description: translate('Toggler for SSL verification'),
        default: true,
        type: 'boolean',
      },
    ],
  },
  {
    description: translate('Proposal settings'),
    items: [
      {
        key: 'PROPOSAL_REVIEW_DURATION',
        description: translate('Review duration in days.'),
        default: 7,
        type: 'integer',
      },
    ],
  },
  {
    description: translate('Table settings'),
    items: [
      {
        key: 'USER_TABLE_COLUMNS',
        description: translate('Comma-separated list of columns for users table.'),
        default: '',
        type: 'string',
      },
    ],
  },
];

