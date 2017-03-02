export default {
  order: [
    'name',
    'image',
    'flavor',
    'system_volume_size',
    'data_volume_size',
    'ssh_public_key',
    'security_groups',
    'internal_ips_set',
    'floating_ip',
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
      warningMessage: 'SSH public key is required for accessing a provisioned VM. You can add a key in your <a ui-sref="profile.keys">profile</a>.'
    },
    security_groups: {
      type: 'multiselect',
      label: 'Security groups',
      component: 'openstackInstanceSecurityGroupsField',
      resource: 'openstacktenant-security-groups',
      parser: group => ({
        value: group.url,
        display_name: group.name,
        object: group
      }),
      serializer: groups => groups.map(group => ({
        url: group.value
      }))
    },
    floating_ip: {
      label: 'Floating IP',
      component: 'openstackInstanceFloatingIp',
      formatter: floatingIPFormatter
    },
    internal_ips_set: {
      type: 'multiselect',
      label: 'SubNets',
      resource: 'openstacktenant-subnets',
      parser: subnet => ({
        value: subnet.url,
        display_name: displaySubNet(subnet),
        object: subnet
      }),
      serializer: subnets => subnets.map(subnet => ({
        subnet: subnet.value,
      })),
      init: (field, model) => (
        model[field.name] = field.choices.map(choice => ({
          value: choice.url,
          display_name: displaySubNet(choice)
        }))
      )
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
  summaryComponent: 'openstackInstanceCheckoutSummary'
};

function displaySubNet(subnet) {
  return `${subnet.name} (${subnet.cidr})`;
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

function imageWatcher(model, options) {
  validateAndSort(model, options, flavorValidator, flavorComparator, 'flavor');
}

function flavorWatcher(model, options, newFlavor) {
  if (newFlavor) {
    model.system_volume_size = Math.max(model.system_volume_size || 0, newFlavor.disk);
    options.system_volume_size.min = newFlavor.disk;
  }
}

function flavorFormatter($filter, flavor) {
  const props = $filter('formatFlavor')(flavor);
  return `${flavor.name} (${props})`;
}

function flavorComparator(a, b) {
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
