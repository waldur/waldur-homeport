import {
  formatFlavorDetails,
  formatPackageDetails,
  parsePackage
} from './utils';

// @ngInject
export default AppstoreFieldConfigurationProvider => {
  AppstoreFieldConfigurationProvider.register('OpenStack.Tenant', {
    order: [
      'name',
      'template',
      'description',
      'access',
      'user_username',
      'user_password'
    ],
    options: {
      name: {
        type: 'string',
        required: true,
        label: 'Tenant name'
      },
      template: {
        type: 'list',
        required: true,
        label: 'VPC package',
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
      description: {
        type: 'text',
        label: 'Description'
      },
      access: {
        type: 'label',
        label: 'Access'
      },
      user_username: {
        type: 'string',
        label: 'Initial admin username',
        placeholder: '<generated username>',
        help_text: 'Leave blank if you want admin username to be auto-generated'
      },
      user_password: {
        type: 'password',
        label: 'Initial admin password',
        placeholder: '<generated password>',
        help_text: 'Leave blank if you want admin password to be auto-generated'
      }
    }
  });

  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Instance', {
    order: [
      'name',
      'image',
      'flavor',
      'system_volume_size',
      'data_volume_size',
      'ssh_public_key',
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
      system_volume_size: {
        type: 'integer',
        required: true,
        label: 'System volume size',
        factor: 1024,
        units: 'GB',
        min: 1,
        max: 320
      },
      data_volume_size: {
        type: 'integer',
        required: true,
        label: 'Data volume size',
        factor: 1024,
        units: 'GB',
        min: 0
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
    }
  });

  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Volume', {
    order: [
      'name',
      'image',
      'size',
      'description'
    ],
    options: {
      name: {
        label: 'Volume name',
        type: 'string',
        required: true,
        maxlength: 150
      },
      image: {
        type: 'list',
        required: false,
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
      size: {
        type: 'integer',
        label: 'Size',
        factor: 1024,
        units: 'GB',
        min: 0,
        max: 320
      },
      description: {
        type: 'text',
        label: 'Description',
        maxlength: 500
      }
    }
  });
}
