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
      label: gettext('CPU limit'),
      default_value: 60,
      factor: 60,
      units: 'hours',
      min: 0,
    },
    gpu_limit: {
      type: 'integer',
      required: true,
      label: gettext('GPU limit'),
      default_value: 60,
      factor: 60,
      units: 'hours',
      min: 0,
    },
    ram_limit: {
      type: 'integer',
      required: true,
      label: gettext('RAM limit'),
      default_value: 1024,
      factor: 1024,
      units: 'GB',
      min: 0,
    },
  },
  summaryComponent: 'slurmAllocationCheckoutSummary',
};

// @ngInject
export default function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('SLURM.Allocation', SlurmAllocationConfig);
}
