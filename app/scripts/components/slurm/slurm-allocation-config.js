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
      label: gettext('VM name'),
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
    },
  }
};

// @ngInject
export default function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('SLURM.Allocation', SlurmAllocationConfig);
}
