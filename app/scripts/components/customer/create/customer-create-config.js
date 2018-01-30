const formatCompanyTypes = ENV =>
  (ENV.plugins.WALDUR_CORE.COMPANY_TYPES || [])
    .map(item => ({ value: item, display_name: item }));

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
    ]
  },
  {
    name: gettext('Billing'),
    title: gettext('Billing details'),
    icon: 'fa-sitemap',
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
        required: true,
        maxlength: 20,
      },
      {
        name: 'bank_name',
        label: gettext('Bank name'),
        type: 'string',
        required: true,
        maxlength: 150,
      },
      {
        name: 'bank_account',
        label: gettext('Bank account'),
        type: 'string',
        required: true,
        maxlength: 50,
      },
      {
        name: 'vat_code',
        label: gettext('EU VAT ID'),
        type: 'string',
        help_text: gettext('Please provide your EU VAT ID if you are registered in the European Union.'),
      },
    ]
  }
  // Ilja: disabled expert registration on creation for the time being. Should only be done through "Manage" tab
  // {
  //   name: gettext('Expert provider'),
  //   title: gettext('Register as expert provider'),
  //   icon: 'fa-sitemap',
  //   feature: 'experts',
  //   fields: [
  //     {
  //       name: 'description',
  //       type: 'description',
  //       description: gettext('If you would like to offer services to other organization, please register as Expert provider.'),
  //     },
  //     {
  //       name: 'agree_with_policy',
  //       type: 'tos',
  //       sref: 'tos.experts',
  //       required: false,
  //     },
  //   ]
  // }
];
