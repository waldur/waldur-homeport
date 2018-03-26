import { latinName } from '@waldur/resource/actions/constants';

// @ngInject
export default {
  order: [
    'name',
    'size',
    'description'
  ],
  options: {
    name: {
      ...latinName,
      label: gettext('Volume name'),
    },
    size: {
      type: 'integer',
      label: gettext('Size'),
      factor: 1024,
      units: 'GB',
      min: 0,
      max: 1024 * 4096
    },
    description: {
      type: 'text',
      label: gettext('Description'),
      maxlength: 500
    }
  },
  summaryComponent: 'openstackVolumeCheckoutSummary'
};
