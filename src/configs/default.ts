import { ApplicationConfigurationOptions } from '@waldur/core/types';

const gettext = (x: string): string => x;

export const ENV: ApplicationConfigurationOptions = {
  // general config
  apiEndpoint: 'http://localhost:8080/',
  marketplaceLandingPageTitle: '',

  pageSizes: [5, 10, 20, 50],
  pageSize: 10,
  defaultErrorMessage: gettext('Reason unknown, please contact support.'),

  // build version
  buildId: 'develop',

  // Either 'accounting' or 'billing'
  accountingMode: 'accounting',

  defaultPullInterval: 5, // seconds
  countersTimerInterval: 30, // seconds

  roles: {
    owner: gettext('Organization owner'),
    manager: gettext('Project manager'),
    admin: gettext('System administrator'),
    member: gettext('Project member'),
  },
  invitationRedirectTime: 5000,

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
