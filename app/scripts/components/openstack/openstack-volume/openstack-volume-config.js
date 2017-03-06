// @ngInject
export default {
  order: [
    'name',
    'image',
    'size',
    'description'
  ],
  options: {
    name: {
      label: gettext('Volume name'),
      type: 'string',
      required: true,
      maxlength: 150
    },
    image: {
      type: 'list',
      required: false,
      label: gettext('Image'),
      columns: [
        {
          name: 'name',
          label: gettext('Image name')
        },
        {
          name: 'min_ram',
          label: gettext('Min RAM'),
          filter: 'filesize'
        },
        {
          name: 'min_disk',
          label: gettext('Min storage'),
          filter: 'filesize'
        }
      ]
    },
    size: {
      type: 'integer',
      label: gettext('Size'),
      factor: 1024,
      units: 'GB',
      min: 0,
      max: 1024 * 320
    },
    description: {
      type: 'text',
      label: gettext('Description'),
      maxlength: 500
    }
  },
  watchers: {
    image: imageWatcher
  },
  summaryComponent: 'openstackVolumeCheckoutSummary'
};

function imageWatcher(model, options, newImage) {
  if (newImage) {
    model.size = Math.max(model.size || 0, newImage.min_disk);
    options.size.min = newImage.min_disk;
  }
}
