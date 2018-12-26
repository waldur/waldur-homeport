import { latinName } from '@waldur/resource/actions/constants';

export default {
  order: [
    'name',
    'image',
    'flavor',
    'system_volume_size',
    'data_volume_size',
    'ssh_public_key',
    'security_groups',
    'networks',
    'description',
    'user_data'
  ],
  options: {
    name: {
      ...latinName,
      label: gettext('VM name'),
    },
    image: {
      type: 'list',
      required: true,
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
    flavor: {
      type: 'list',
      required: true,
      label: gettext('Flavor'),
      formatter: flavorFormatter,
      columns: [
        {
          name: 'name',
          label: gettext('Flavor name')
        },
        {
          name: 'cores',
          label: gettext('vCPU')
        },
        {
          name: 'ram',
          label: gettext('RAM'),
          filter: 'filesize'
        },
        {
          name: 'disk',
          label: gettext('Storage'),
          filter: 'filesize'
        }
      ]
    },
    system_volume_size: {
      type: 'integer',
      required: true,
      label: gettext('System volume size'),
      factor: 1024,
      units: 'GB',
      min: 1024,
      max: 1024 * 4096
    },
    data_volume_size: {
      component: 'openstackInstanceDataVolume',
      factor: 1024,
      units: 'GB',
      min: 1024,
      max: 1024 * 4096
    },
    ssh_public_key: {
      type: 'list',
      label: gettext('SSH public key'),
      columns: [
        {
          name: 'name',
          label: gettext('Name')
        },
        {
          name: 'fingerprint',
          label: gettext('Fingerprint')
        }
      ],
      preselectFirst: true,
      emptyMessage: gettext('You have not added any SSH keys to your <a ui-sref="profile.keys">profile</a>.')
    },
    security_groups: {
      type: 'multiselect',
      label: gettext('Security groups'),
      placeholder: gettext('Select security groups...'),
      component: 'openstackInstanceSecurityGroupsField',
      default: 'default',
      resource: context => ({
        endpoint: 'openstacktenant-security-groups',
        params: {
          settings_uuid: context.settings_uuid,
        }
      }),
      parser: group => ({
        value: group.url,
        display_name: group.name,
        object: group
      }),
      serializer: groups => groups.map(group => ({
        url: group.value
      }))
    },
    networks: {
      label: gettext('Networks'),
      component: 'openstackInstanceNetworks',
      resources: context => ({
        subnets: {
          endpoint: 'openstacktenant-subnets',
          params: {
            settings_uuid: context.settings_uuid,
          }
        },
        floating_ips: {
          endpoint: 'openstacktenant-floating-ips',
          params: {
            settings_uuid: context.settings_uuid,
            is_booked: 'False',
            runtime_state: 'DOWN',
            free: 'True',
          }
        }
      })
    },
    description: {
      type: 'text',
      label: gettext('Description'),
      maxlength: 500
    },
    user_data: {
      type: 'text',
      label: gettext('User data'),
      help_text: gettext('Additional data that will be added to instance on provisioning.')
    }
  },
  watchers: {
    image: imageWatcher,
    flavor: flavorWatcher,
  },
  summaryComponent: 'openstackInstanceCheckoutSummary',
  saveConfirmation: saveConfirmation,
  onSuccess: onSuccess,
};

export function internalIpFormatter(subnet) {
  return `${subnet.name} (${subnet.cidr})`;
}

function saveConfirmation($q, instance) {
  // * must return a promise //
  let deferred = $q.defer();
  if (!instance.hasOwnProperty('data_volume_size') || instance.data_volume_size === undefined) {
    const message = gettext('Are you sure you do not want to create a data volume? System volume is not resizable');
    if (confirm(message)) {
      deferred.resolve();
    } else {
      deferred.reject();
    }
  } else {
    deferred.resolve();
  }

  return deferred.promise;
}

function validateAndSort(model, options, validator, comparator, name) {
  const choices = options[name].choices;
  angular.forEach(choices, choice => {
    choice.disabled = validator(model, choice);
  });
  choices.sort(comparator);
  if (model[name] && model[name].disabled) {
    model[name] = null;
  }
}

function getMinSystemVolumeSize(model) {
  const imageMinValue = model.image ? model.image.min_disk : 0;
  const flavorMinValue = model.flavor ? model.flavor.disk : 0;
  return Math.max(imageMinValue, flavorMinValue);
}

function updateSystemVolumeSize(model, options) {
  const minValue = getMinSystemVolumeSize(model);
  const currentValue = model.system_volume_size || 0;
  const value = Math.max(currentValue, minValue);

  model.system_volume_size = value;
  options.system_volume_size.min = minValue;
}

function imageWatcher(model, options) {
  validateAndSort(model, options, flavorValidator, flavorComparator, 'flavor');
  updateSystemVolumeSize(model, options);
}

function flavorWatcher(model, options) {
  updateSystemVolumeSize(model, options);
}

export function flavorFormatter($filter, flavor) {
  const props = $filter('formatFlavor')(flavor);
  return `${flavor.name} (${props})`;
}

export function flavorComparator(a, b) {
  if (a.disabled < b.disabled) return -1;
  if (a.disabled > b.disabled) return 1;

  if (a.cores > b.cores) return 1;
  if (a.cores < b.cores) return -1;

  if (a.ram > b.ram) return 1;
  if (a.ram < b.ram) return -1;

  if (a.disk > b.disk) return 1;
  if (a.disk < b.disk) return -1;
  return 0;
}

export function flavorValidator(model, choice) {
  if (!model.image) {
    return true;
  }
  if (model.image.min_ram > choice.ram) {
    return true;
  }
  return false;
}

function onSuccess($injector) {
  const openstackFloatingIpsService = $injector.get('openstackFloatingIpsService');
  openstackFloatingIpsService.clearAllCacheForCurrentEndpoint();
}
