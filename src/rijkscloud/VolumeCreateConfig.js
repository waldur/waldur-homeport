const RijkscloudVolumeConfig = {
  order: [
    'name',
    'description',
    'size',
  ],
  options: {
    name: {
      type: 'string',
      required: true,
      label: gettext('Volume name'),
      form_text: gettext('This name will be visible in accounting data.'),
      maxlength: 150
    },
    description: {
      type: 'text',
      required: false,
      label: gettext('Description'),
      maxlength: 500,
    },
    size: {
      type: 'integer',
      required: true,
      label: gettext('Volume size'),
      default_value: 1024,
      factor: 1024,
      units: 'GB',
      min: 0,
    },
  },
  summaryComponent: 'rijkscloudVolumeCheckoutSummary',
};

// @ngInject
export default function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('Rijkscloud.Volume', RijkscloudVolumeConfig);
}
