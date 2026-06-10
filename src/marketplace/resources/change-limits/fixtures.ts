import { Offering } from '@/marketplace/types';
import { TENANT_TYPE } from '@/openstack/constants';

import { StateProps } from './utils';

export const plan = {
  prices: {
    cores: 0.048,
    ram: 0.0166666,
    storage: 0.0016667,
  },
  unit: 'day',
};

export const offering = {
  components: [
    {
      type: 'cores',
      name: 'Cores',
      measured_unit: 'cores',
      is_boolean: false,
      billing_type: 'limit',
    },
    {
      type: 'ram',
      name: 'RAM',
      measured_unit: 'GB',
      is_boolean: false,
      billing_type: 'limit',
    },
    {
      type: 'storage',
      name: 'Storage',
      measured_unit: 'GB',
      is_boolean: false,
      billing_type: 'limit',
    },
  ],
  type: TENANT_TYPE,
  plugin_options: { enable_purchase_order_upload: true },
} as Offering;

export const newLimits = {
  cores: 10,
  ram: 20,
  storage: 30,
};

export const currentLimits = {
  cores: 66,
  ram: 130,
  storage: 2001,
};

export const usages = {
  cores: 3,
  ram: 5,
  storage: 255,
};

export const orderCanBeApproved = true;

// Components have no explicit limit_period — the helper defaults them to 'month'.
// Plan unit is 'day' so the monthly price = subTotal × 30.
export const resultData: StateProps = {
  components: [
    {
      type: 'cores',
      name: 'Cores',
      measured_unit: 'cores',
      is_boolean: false,
      usage: 3,
      limit: 66,
      subTotal: 0.48,
      changedSubTotal: -2.688,
      changedLimit: -56,
      chargeMode: 'month',
      price: 14.399999999999999,
      changedPrice: -80.64,
      priceSuffix: ' /mo',
    },
    {
      type: 'ram',
      name: 'RAM',
      measured_unit: 'GB',
      is_boolean: false,
      usage: 5,
      limit: 130,
      subTotal: 0.333332,
      changedSubTotal: -1.833326,
      changedLimit: -110,
      chargeMode: 'month',
      price: 9.99996,
      changedPrice: -54.99978,
      priceSuffix: ' /mo',
    },
    {
      type: 'storage',
      name: 'Storage',
      measured_unit: 'GB',
      is_boolean: false,
      usage: 255,
      limit: 2001,
      subTotal: 0.050001,
      changedSubTotal: -3.2850657,
      changedLimit: -1971,
      chargeMode: 'month',
      price: 1.50003,
      changedPrice: -98.551971,
      priceSuffix: ' /mo',
    },
  ],
  periodTotals: [
    {
      chargeMode: 'month',
      label: 'Monthly total',
      total: 25.89999,
      changedTotal: -234.191751,
      priceSuffix: ' /mo',
    },
  ],
  offering,
  orderCanBeApproved: true,
  shouldConcealPrices: false,
  newLimits,
};
