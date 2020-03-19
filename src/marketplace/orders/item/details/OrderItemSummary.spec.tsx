import { BillingType } from '@waldur/marketplace/types';

import { getUpdateSummary } from './OrderItemSummary';

const COMPONENTS = [
  {
    billing_type: 'usage' as BillingType,
    type: 'gigabytes_gpfs',
    name: 'Storage (gpfs)',
    description: 'Capacity optimized HDD',
    measured_unit: 'GB',
    limit_period: null,
    limit_amount: null,
    disable_quotas: false,
    use_limit_for_billing: true,
    product_code: '',
    article_code: '',
    max_value: null,
    min_value: null,
    factor: null,
  },
  {
    billing_type: 'usage' as BillingType,
    type: 'gigabytes_rbd-ec',
    name: 'Storage (rbd-ec)',
    description: 'General purpose SSD',
    measured_unit: 'GB',
    limit_period: null,
    limit_amount: null,
    disable_quotas: false,
    use_limit_for_billing: true,
    product_code: '',
    article_code: '',
    max_value: null,
    min_value: null,
    factor: null,
  },
  {
    billing_type: 'fixed' as BillingType,
    type: 'cores',
    name: 'Cores',
    description: '',
    measured_unit: 'cores',
    limit_period: null,
    limit_amount: null,
    disable_quotas: false,
    use_limit_for_billing: false,
    product_code: '',
    article_code: '',
    max_value: 500,
    min_value: 1,
    factor: 1,
  },
  {
    billing_type: 'fixed' as BillingType,
    type: 'ram',
    name: 'RAM',
    description: '',
    measured_unit: 'GB',
    limit_period: null,
    limit_amount: null,
    disable_quotas: false,
    use_limit_for_billing: false,
    product_code: '',
    article_code: '',
    max_value: 20480000,
    min_value: 1024,
    factor: 1024,
  },
  {
    billing_type: 'fixed' as BillingType,
    type: 'storage',
    name: 'Storage',
    description: '',
    measured_unit: 'GB',
    limit_period: null,
    limit_amount: null,
    disable_quotas: false,
    use_limit_for_billing: false,
    product_code: '',
    article_code: '',
    max_value: 102400000,
    min_value: 10240,
    factor: 1024,
  },
];

describe('OrderItemSummary', () => {
  const orderItem = {
    attributes: {
      old_limits: {
        cpu: 10,
        storage: 1024 * 100,
      },
    },
    limits: {
      cpu: 30,
      storage: 1024 * 300,
    },
    resource_name: 'Demo Cloud',
    old_plan_name: 'Basic',
    new_plan_name: 'Advanced',
    old_cost_estimate: '100',
    new_cost_estimate: '300',
  };

  it('formats update summary with components', () => {
    const ctx = {
      orderItem,
      user: 'Alice Lebowski',
      components: COMPONENTS,
    };
    expect(getUpdateSummary(ctx)).toMatchSnapshot();
  });

  it('formats update summary without components', () => {
    const ctx = {
      orderItem,
      user: 'Alice Lebowski',
      components: [],
    };
    expect(getUpdateSummary(ctx)).toMatchSnapshot();
  });
});
