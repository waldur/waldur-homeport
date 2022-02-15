import { StateProps } from '@waldur/marketplace/resources/change-limits/connector';

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
  type: 'OpenStack.Admin',
};

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

export const resultData: StateProps = {
  periods: ['Price per day', 'Price per 30 days', 'Price per 365 days'],
  components: [
    {
      type: 'cores',
      name: 'Cores',
      measured_unit: 'cores',
      is_boolean: false,
      usage: 3,
      limit: 66,
      prices: [0.48, 14.399999999999999, 175.2],
      changedPrices: [-2.688, -80.64, -981.12],
      subTotal: 0.48,
      changedSubTotal: -2.688,
      changedLimit: -56,
    },
    {
      type: 'ram',
      name: 'RAM',
      measured_unit: 'GB',
      is_boolean: false,
      usage: 5,
      limit: 130,
      prices: [0.333332, 9.99996, 121.66618000000001],
      changedPrices: [-1.833326, -54.99978, -669.16399],
      subTotal: 0.333332,
      changedSubTotal: -1.833326,
      changedLimit: -110,
    },
    {
      type: 'storage',
      name: 'Storage',
      measured_unit: 'GB',
      is_boolean: false,
      usage: 255,
      limit: 2001,
      prices: [0.050001, 1.50003, 18.250365],
      changedPrices: [-3.2850656999999996, -98.551971, -1199.0489805],
      subTotal: 0.050001,
      changedSubTotal: -3.2850656999999996,
      changedLimit: -1971,
    },
  ],
  orderCanBeApproved: true,
  totalPeriods: [0.8633329999999999, 25.899989999999995, 315.116545],
  changedTotalPeriods: [-7.8063917, -234.19175099999998, -2849.3329705],
};
