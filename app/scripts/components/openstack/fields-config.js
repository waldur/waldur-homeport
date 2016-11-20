import { formatFlavorDetails, formatPackageDetails, parsePackage } from './utils';

// @ngInject
export default AppstoreFieldConfigurationProvider => {
  AppstoreFieldConfigurationProvider.register('OpenStack.Tenant', (formOptions, validChoices) => [
    {
      name: 'name',
      type: 'string',
      required: true,
      label: 'Tenant name'
    },
    {
      name: 'template',
      type: 'list',
      required: true,
      label: 'VPC package',
      choices: validChoices.template,
      listComponent: 'openstackTemplateList',
      dialogTitle: 'Select Virtual Private Cloud package',
      dialogSize: 'lg',
      formatValue: formatPackageDetails,
      parseChoices: parsePackage
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description'
    },
    {
      name: 'access',
      type: 'label',
      label: 'Access'
    },
    {
      name: 'user_username',
      type: 'string',
      label: 'Initial admin username',
      placeholder: '<generated username>',
      help_text: 'Leave blank if you want admin username to be auto-generated'
    },
    {
      name: 'user_password',
      type: 'password',
      label: 'Initial admin password',
      placeholder: '<generated password>',
      help_text: 'Leave blank if you want admin password to be auto-generated'
    }
  ]);

  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Instance', (formOptions, validChoices) => [
    {
      name: 'name',
      type: 'string',
      required: true,
      label: 'VM name',
      maxlength: 150
    },
    {
      name: 'image',
      type: 'list',
      required: true,
      label: 'Image',
      choices: validChoices.image,
      listComponent: 'openstackImageList'
    },
    {
      name: 'flavor',
      type: 'list',
      required: true,
      label: 'Flavor',
      choices: validChoices.flavor,
      listComponent: 'openstackFlavorList',
      dialogTitle: 'Select OpenStack flavor',
      formatValue: formatFlavorDetails
    },
    {
      name: 'system_volume_size',
      type: 'integer',
      required: true,
      label: 'System volume size',
      factor: 1024,
      units: 'GB',
      min: 1,
      max: 320
    },
    {
      name: 'data_volume_size',
      type: 'integer',
      required: true,
      label: 'Data volume size',
      factor: 1024,
      units: 'GB',
      min: 0
    },
    {
      name: 'ssh_public_key',
      type: 'list',
      label: 'SSH public key',
      choices: validChoices.ssh_public_key,
      columns: [
        {
          name: 'name',
          label: 'Name'
        },
        {
          name: 'fingerprint',
          label: 'Fingerprint'
        }
      ]
    },
    {
      name: 'skip_external_ip_assignment',
      type: 'boolean',
      label: 'Skip external IP assignment'
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
      maxlength: 500
    },
    {
      name: 'user_data',
      type: 'text',
      label: 'User data',
      help_text: 'Additional data that will be added to instance on provisioning'
    }
  ]);
}
