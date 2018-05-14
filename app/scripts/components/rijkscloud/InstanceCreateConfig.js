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
      type: 'select',
      label: gettext('Internal IP'),
      parser: item => ({
        value: item.url,
        display_name: item.address
      }),
      serializer: item => item.value,
      resource: context => ({
        endpoint: 'rijkscloud-internal-ips',
        params: {
          settings_uuid: context.settings_uuid,
          is_available: true,
        }
      }),
    },
    floating_ip: {
      type: 'select',
      label: gettext('Floating IP'),
      parser: item => ({
        value: item.url,
        display_name: item.address
      }),
      serializer: item => item.value,
      resource: context => ({
        endpoint: 'rijkscloud-floating-ips',
        params: {
          settings_uuid: context.settings_uuid,
          is_available: true,
        }
      }),
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
