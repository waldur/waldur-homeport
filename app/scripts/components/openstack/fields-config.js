import {
  formatFlavorDetails,
  formatPackageDetails,
  parsePackage,
  compareFlavors
} from './utils';

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
      dialogTitle: 'Select Virtual Private Cloud package',
      dialogSize: 'lg',
      formatValue: formatPackageDetails,
      parseChoices: parsePackage,
      columns: [
        {
          name: 'name',
          label: 'VPC package'
        },
        {
          name: 'cores',
          label: 'Max vCPU'
        },
        {
          name: 'ram',
          label: 'Max RAM',
          filter: 'filesize'
        },
        {
          name: 'storage',
          label: 'Max storage',
          filter: 'filesize'
        },
        {
          name: 'dailyPrice',
          label: '1 day',
          filter: 'defaultCurrency'
        },
        {
          name: 'monthlyPrice',
          label: '1 month',
          filter: 'defaultCurrency'
        },
        {
          name: 'annualPrice',
          label: '1 year',
          filter: 'defaultCurrency'
        }
      ]
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
    {
      name: 'flavor',
      type: 'list',
      required: true,
      label: 'Flavor',
      choices: validChoices.flavor,
      formatValue: formatFlavorDetails,
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
  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Volume', (formOptions, validChoices) => [
    {
      name: 'name',
      label: 'Volume name',
      type: 'string',
      required: true,
      max_length: 150
    },
    {
      name: 'image',
      type: 'list',
      required: false,
      label: 'Image',
      choices: validChoices.image,
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
    {
      name: 'size',
      type: 'integer',
      label: 'Size',
      factor: 1024,
      units: 'GB',
      min: 0,
      max: 320
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
      maxlength: 500
    }
  ]);
}
