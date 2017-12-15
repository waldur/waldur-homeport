const JiraProjectConfig = {
  order: [
    'name',
    'key',
    'template',
    'description',
  ],
  options: {
    name: {
      type: 'string',
      required: true,
      label: gettext('Name'),
      form_text: gettext('This name will be visible in accounting data.'),
      maxlength: 150
    },
    key: {
      type: 'string',
      required: true,
      label: 'Key',
      minlength: 2,
      maxlength: 10,
      form_text: gettext('Key should consist of uppercase letters.'),
    },
    template: {
      type: 'list',
      preselectFirst: true,
      required: true,
      label: gettext('Type'),
      columns: [
        {
          name: 'name',
          label: gettext('Name'),
          headerClass: 'col-md-4'
        },
        {
          name: 'description',
          label: gettext('Description')
        }
      ],
    },
    description: {
      type: 'text',
      required: false,
      label: gettext('Description'),
      maxlength: 500,
    },
  },
  summaryComponent: 'jiraProjectCheckoutSummary',
  onSuccess: onSuccess,
};

// @ngInject
export default function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('JIRA.Project', JiraProjectConfig);
}

function onSuccess($injector) {
  const JiraProjectService = $injector.get('JiraProjectService');
  JiraProjectService.clearAllCacheForCurrentEndpoint();
}
