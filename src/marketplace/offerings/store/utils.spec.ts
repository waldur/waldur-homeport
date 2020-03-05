import { OfferingComponent } from '@waldur/marketplace/types';

import { formatOfferingRequest } from './utils';

const OFFERING_FORM_DATA = {
  name: 'Offering',
  category: {
    title: 'VMs',
    url: 'URL',
    icon: 'URL',
    offering_count: 1,
    sections: [],
  },
  type: {
    value: 'VMware.VirtualMachine',
    label: 'vSphere Virtual machine',
  },
  attributes: {},
  options: [],
  plans: [
    {
      name: 'Basic',
      unit: {
        label: 'Per month',
        value: 'month',
      },
      prices: {
        disk: 700,
        ram: 800,
        cpu: 900,
      },
      quotas: {
        disk: 10,
        ram: 10,
        cpu: 10,
      },
      archived: false,
      unit_price: 0,
    },
  ],
};

const USAGE_COMPONENTS: OfferingComponent[] = [
  {
    billing_type: 'usage',
    type: 'disk',
    name: 'Disk',
    description: '',
    measured_unit: 'MB',
    limit_period: null,
    limit_amount: null,
  },
  {
    billing_type: 'usage',
    type: 'ram',
    name: 'RAM',
    description: '',
    measured_unit: 'MB',
    limit_period: null,
    limit_amount: null,
  },
  {
    billing_type: 'usage',
    type: 'cpu',
    name: 'CPU',
    description: '',
    measured_unit: 'hours',
    limit_period: null,
    limit_amount: null,
  },
];

const FIXED_COMPONENTS: OfferingComponent[] = [
  {
    billing_type: 'fixed',
    type: 'disk',
    name: 'Disk',
    description: '',
    measured_unit: 'MB',
    limit_period: null,
    limit_amount: null,
  },
  {
    billing_type: 'fixed',
    type: 'ram',
    name: 'RAM',
    description: '',
    measured_unit: 'MB',
    limit_period: null,
    limit_amount: null,
  },
  {
    billing_type: 'fixed',
    type: 'cpu',
    name: 'CPU',
    description: '',
    measured_unit: 'hours',
    limit_period: null,
    limit_amount: null,
  },
];

describe('Marketplace offering serializer', () => {
  it('should skip quotas for built-in usage components', () => {
    expect(
      formatOfferingRequest(OFFERING_FORM_DATA, USAGE_COMPONENTS).plans[0]
        .quotas,
    ).toEqual({});
  });

  it('should not skip quotas for built-in fixed components', () => {
    expect(
      formatOfferingRequest(OFFERING_FORM_DATA, FIXED_COMPONENTS).plans[0]
        .quotas,
    ).toEqual({
      disk: 10,
      ram: 10,
      cpu: 10,
    });
  });
});
