import { getTenantTemplate, templateParser, parsePrices } from './utils';

describe('parsePrices', () => {
  it('parses template component prices to standard format', () => {
    const components = [
      {
        type: 'cores',
        amount: 1,
        price: '124.0000000000',
      },
      {
        type: 'ram',
        amount: 1,
        price: '12.0000000000',
      },
      {
        type: 'storage',
        amount: 1,
        price: '200.0000000000',
      },
    ];
    const expectedPrices = {
      cores: 124,
      ram: 12,
      disk: 200,
    };
    expect(parsePrices(components)).toEqual(expectedPrices);
  });
});

describe('templateParser', () => {
  it('converts template components to standard format', () => {
    const template = {
      url: 'https://example.com/api/package-templates/8528cdb62eb745909945ef9428a56c20/',
      uuid: '8528cdb62eb745909945ef9428a56c20',
      name: 'Small Package',
      price: '72.0000000000',
      components: [
        {
          type: 'cores',
          amount: 1,
          price: '124.0000000000',
        },
        {
          type: 'ram',
          amount: 1,
          price: '12.0000000000',
        },
        {
          type: 'storage',
          amount: 1,
          price: '200.0000000000',
        },
      ],
      category: 'Small',
    };
    const expectedTemplate = {
      dailyPrice: 72,
      monthlyPrice: 2160,
      annualPrice: 26280,
      cores: 1,
      ram: 1,
      disk: 1,
    };
    expect(templateParser(template)).toEqual(jasmine.objectContaining(expectedTemplate));
  });
});

describe('getTenantTemplate', () => {
  it('converts tenant quotas to standard flavor format', () => {
    const tenant = {
      extra_configuration: {
        package_name: 'Trial package',
        package_category: 'Small',
      },
      quotas: [
        {
          name: 'vcpu',
          limit: 10.0,
        },
        {
          name: 'ram',
          limit: 10240.0,
        },
        {
          name: 'storage',
          limit: 51200.0,
        },
      ],
    };
    const expectedTemplate = {
      name: 'Trial package',
      category: 'Small',
      cores: 10.0,
      ram: 10240.0,
      disk: 51200.0,
    };
    expect(getTenantTemplate(tenant)).toEqual(expectedTemplate);
  });
});
