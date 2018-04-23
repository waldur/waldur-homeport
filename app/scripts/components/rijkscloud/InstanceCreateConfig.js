const InstanceCreateConfig = {
  order: [
    'name',
    'flavor',
    'internal_ip',
    'floating_ip',
    'user_data'
  ],
  options: {
    name: {
      type: 'string',
      required: true,
      label: gettext('VM name'),
      maxlength: 150
    },
    flavor: {
      type: 'list',
      required: true,
      label: gettext('Flavor'),
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
      ],
      formatter: flavorFormatter
    },
    internal_ip: {
      type: 'list',
      label: gettext('Internal IP'),
      columns: [
        {
          name: 'name',
          label: gettext('Name')
        },
        {
          name: 'address',
          label: gettext('IP address')
        }
      ],
    },
    floating_ip: {
      type: 'list',
      label: gettext('Floating IP'),
      columns: [
        {
          name: 'name',
          label: gettext('Name')
        },
        {
          name: 'address',
          label: gettext('IP address')
        }
      ],
    },
    user_data: {
      type: 'text',
      label: gettext('User data'),
      help_text: gettext('Additional data that will be added to instance on provisioning.')
    }
  },
};

function flavorFormatter($filter, value) {
  const ram = $filter('filesize')(value.ram);
  const props = `${value.cores} vCPU, ${ram} RAM`;
  return `${value.name} (${props})`;
}

// @ngInject
export default function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('Rijkscloud.Instance', InstanceCreateConfig);
}
