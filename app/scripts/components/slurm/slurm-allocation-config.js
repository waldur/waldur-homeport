const SlurmAllocationConfig = {
  order: [
    'name',
    'description',
    'cpu_limit',
    'gpu_limit',
    'ram_limit',
    'billing_label',
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
      label: gettext('CPU limit, minutes'),
      default_value: -1,
    },
    gpu_limit: {
      type: 'integer',
      required: true,
      label: gettext('GPU limit, minutes'),
      default_value: -1,
    },
    ram_limit: {
      type: 'integer',
      required: true,
      label: gettext('RAM limit, MB'),
      default_value: -1,
    },
    billing_label: {
      type: 'label',
      label: gettext('Please note, that actual billing will be usage based.'),
    },
  }
};

// @ngInject
export default function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('SLURM.Allocation', SlurmAllocationConfig);
}
