export default {
  order: [
    'name',
    'image',
    'flavor',
    'system_volume_size',
    'data_volume_size',
    'ssh_public_key',
    'floating_ip',
    'skip_external_ip_assignment',
    'description',
    'user_data'
  ],
  options: {
    name: {
      type: 'string',
      required: true,
      label: 'VM name',
      maxlength: 150
    },
    image: {
      type: 'list',
      required: true,
      label: 'Image',
      columns: [
        {
          name: 'name',
          label: 'Image name'
        },
        {
          name: 'min_ram',
          label: 'Min RAM',
          filter: 'filesize'
        },
        {
          name: 'min_disk',
          label: 'Min storage',
          filter: 'filesize'
        }
      ]
    },
    flavor: {
      type: 'list',
      required: true,
      label: 'Flavor',
      formatter: flavorFormatter,
      columns: [
        {
          name: 'name',
          label: 'Flavor name'
        },
        {
          name: 'cores',
          label: 'vCPU'
        },
        {
          name: 'ram',
          label: 'RAM',
          filter: 'filesize'
        },
        {
          name: 'disk',
          label: 'Storage',
          filter: 'filesize'
        }
      ]
    },
    system_volume_size: {
      type: 'integer',
      required: true,
      label: 'System volume size',
      factor: 1024,
      units: 'GB',
      min: 1024,
      max: 1024 * 320
    },
    data_volume_size: {
      type: 'integer',
      required: true,
      label: 'Data volume size',
      factor: 1024,
      units: 'GB',
      min: 1024,
      max: 1024 * 320
    },
    ssh_public_key: {
      type: 'list',
      label: 'SSH public key',
      columns: [
        {
          name: 'name',
          label: 'Name'
        },
        {
          name: 'fingerprint',
          label: 'Fingerprint'
        }
      ],
      warningMessage: `SSH public key is required for accessing a provisioned VM. You can add a key in your <a ui-sref="profile.keys">profile</a>.`
    },
    floating_ip: {
      type: 'list',
      label: 'Floating IP',
      columns: [
        {
          name: 'address',
          label: 'Address'
        }
      ],
      formatter: floatingIPFormatter
    },
    skip_external_ip_assignment: {
      type: 'boolean',
      label: 'Skip external IP assignment'
    },
    description: {
      type: 'text',
      label: 'Description',
      maxlength: 500
    },
    user_data: {
      type: 'text',
      label: 'User data',
      help_text: 'Additional data that will be added to instance on provisioning'
    }
  },
  watchers: {
    image: imageWatcher,
    flavor: flavorWatcher
  },
  summaryComponent: 'openstackInstanceSummary'
};

function validateAndSort(model, options, validator, comparator, name) {
  const choices = options[name].choices;
  angular.forEach(choices, choice => {
    choice.item.disabled = validator(model, choice.item);
  });
  choices.sort(comparator);
  if (model[name] && model[name].disabled) {
    model[name] = null;
  }
}

function imageWatcher(model, options) {
  validateAndSort(model, options, flavorValidator, flavorComparator, 'flavor');
}

function flavorWatcher(model, options, newFlavor) {
  if (newFlavor) {
    model.system_volume_size = Math.max(model.system_volume_size || 0, newFlavor.disk);
    options.system_volume_size.min = newFlavor.disk;
  }
}

function flavorFormatter($filter, value) {
  const ram = $filter('filesize')(value.ram);
  const storage = $filter('filesize')(value.disk);
  const props = `${value.cores} vCPU, ${ram} RAM, ${storage} storage`;
  return `${value.name} (${props})`;
}

function flavorComparator(a, b) {
  if (a.item.disabled < b.item.disabled) return -1;
  if (a.item.disabled > b.item.disabled) return 1;

  if (a.item.cores > b.item.cores) return 1;
  if (a.item.cores < b.item.cores) return -1;

  if (a.item.ram > b.item.ram) return 1;
  if (a.item.ram < b.item.ram) return -1;

  if (a.item.disk > b.item.disk) return 1;
  if (a.item.disk < b.item.disk) return -1;
  return 0;
}

function flavorValidator(model, choice) {
  if (!model.image) {
    return true;
  }
  if (model.image.min_ram > choice.ram) {
    return true;
  }
  if (model.image.min_disk > choice.disk) {
    return true;
  }
  return false;
}

function floatingIPFormatter($filter, value) {
  return value.address;
}
