import { getTenantTemplate } from './openstack-template';

describe('getTenantTemplate', () => {
  it('converts tenant quotas to standard flavor format', () => {
    const tenant = {
      extra_configuration: {
        package_name: 'Trial package',
        package_category: 'Small'
      },
      quotas: [
        {
          name: 'vcpu',
          limit: 10.0
        },
        {
          name: 'ram',
          limit: 10240.0
        },
        {
          name: 'storage',
          limit: 51200.0
        }
      ]
    };
    const expectedTemplate = {
      name: 'Trial package',
      category: 'Small',
      flavor: {
        cores: 10.0,
        ram: 10240.0,
        disk: 51200.0
      }
    };
    expect(getTenantTemplate(tenant)).toEqual(expectedTemplate);
  });
});
