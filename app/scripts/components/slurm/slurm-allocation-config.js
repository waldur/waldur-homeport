const SlurmAllocationConfig = {
  order: [
    'name',
    'description',
    'cpu_limit',
  ],
  options: {
    name: {
      type: 'string',
      required: true,
      label: gettext('Allocation name'),
      form_text: gettext('This name will be visible in accounting data.'),
      maxlength: 150
    },
    description: {
      type: 'text',
      required: false,
      label: gettext('Description'),
      maxlength: 500,
    },
    cpu_limit: {
      type: 'integer',
      required: true,
      label: 'CPU limit, minutes',
      default_value: -1,
    },
  }
};

// @ngInject
export default function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('SLURM.Allocation', SlurmAllocationConfig);
}
