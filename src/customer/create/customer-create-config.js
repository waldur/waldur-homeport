import { LATIN_NAME_PATTERN } from '@waldur/core/utils';

const formatCompanyTypes = ENV =>
  (ENV.plugins.WALDUR_CORE.COMPANY_TYPES || []).map(item => ({
    value: item,
    display_name: item,
  }));

export default ENV => [
  {
    name: gettext('General'),
    title: gettext('General information'),
    fields: [
      {
        name: 'name',
        type: 'string',
        required: true,
        label: gettext('Name'),
        maxlength: 150,
        help_text: gettext('Name of your organization.'),
        pattern: ENV.enforceLatinName && LATIN_NAME_PATTERN,
      },
      {
        name: 'domain',
        label: gettext('Home organization domain name'),
        component: 'customer-domain-field',
        hidden: !ENV.organizationDomainVisible,
      },
      {
        name: 'native_name',
        type: 'string',
        label: gettext('Native name'),
        maxlength: 160,
        hidden: ENV.plugins.WALDUR_CORE.NATIVE_NAME_ENABLED !== true,
      },
      {
        name: 'type',
        type: 'select',
        label: gettext('Organization type'),
        choices: formatCompanyTypes(ENV),
        hidden: formatCompanyTypes(ENV).length === 0,
      },
      {
        name: 'email',
        type: 'email',
        label: gettext('Contact e-mail'),
        required: true,
      },
      {
        name: 'phone_number',
        type: 'tel',
        label: gettext('Contact phone'),
      },
      {
        name: 'homepage',
        type: 'string',
        label: gettext('Website URL'),
      },
      {
        name: 'image',
        type: 'file',
        label: gettext('Logo'),
        accept: '.jpg, .jpeg, .png, .svg',
      },
    ],
  },
  {
    name: gettext('Billing'),
    title: gettext('Billing details'),
    icon: 'fa-sitemap',
    hidden: ENV.hideOrganizationBillingStep,
    fields: [
      {
        name: 'registration_code',
        type: 'string',
        label: gettext('Organization registration code'),
        maxlength: 150,
        required: true,
        help_text: gettext('Please provide registration code of your company.'),
      },
      {
        name: 'country',
        label: gettext('Country'),
        component: 'customer-country-field',
        placeholder: gettext('Select country...'),
      },
      {
        name: 'address',
        label: gettext('Address'),
        type: 'string',
        required: true,
        maxlength: 300,
      },
      {
        name: 'postal',
        label: gettext('Postal code'),
        type: 'string',
        maxlength: 20,
      },
      {
        name: 'bank_name',
        label: gettext('Bank name'),
        type: 'string',
        maxlength: 150,
      },
      {
        name: 'bank_account',
        label: gettext('Bank account'),
        type: 'string',
        maxlength: 50,
      },
      {
        name: 'vat_code',
        label: gettext('EU VAT ID'),
        type: 'string',
        help_text: gettext(
          'Please provide your EU VAT ID if you are registered in the European Union.',
        ),
      },
    ],
  },
];
