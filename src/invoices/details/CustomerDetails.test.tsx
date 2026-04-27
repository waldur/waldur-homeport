import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  CountryEnum,
  CustomerDetails as CustomerDetailsType,
} from 'waldur-js-client';

import { Customer } from '@/workspace/types';

import { CustomerDetails } from './CustomerDetails';

const Customer: CustomerDetailsType = {
  name: 'OpenNode',
  address: 'Lille 4-205',
  country: 'EE' as CountryEnum,
  country_name: 'Estonia',
  email: 'info@opennodecloud.com',
  postal: '80041',
  phone_number: '3725555555',
  bank_name: 'Estonian Bank',
  bank_account: '123456789',
  vat_code: 'EE123456789',
};

describe('CustomerDetails', () => {
  it('renders all rows', () => {
    const wrapper = render(<CustomerDetails customer={Customer} />);
    expect(wrapper.container).toMatchSnapshot();
  });
});
