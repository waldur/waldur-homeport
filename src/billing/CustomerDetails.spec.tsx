import { render } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { PureCustomerDetails } from './CustomerDetails';

const Customer = {
  name: 'OpenNode',
  address: 'Lille 4-205',
  country: 'Estonia',
  email: 'info@opennodecloud.com',
  postal: '80041',
  phone_number: {
    country_code: '372',
    national_number: '5555555',
  },
  bank_name: 'Estonian Bank',
  bank_account: '123456789',
  vat_code: 'EE123456789',
};

describe('CustomerDetails', () => {
  it('renders all rows', () => {
    const wrapper = render(
      <PureCustomerDetails customer={Customer} translate={translate} />,
    );
    expect(wrapper.html()).toMatchSnapshot();
  });
});
