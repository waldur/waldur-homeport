import { shallow } from 'enzyme';
import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { translate } from '@waldur/i18n';
import { PureOpenstackInstanceCheckoutSummary } from '@waldur/openstack/openstack-instance/OpenstackInstanceCheckoutSummary';
import { summaryData as dataWithoutFlavor, flavor } from '@waldur/openstack/openstack-instance/storyFixtures';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';

jest.mock('@waldur/core/services', () => ({
  defaultCurrency: val => val,
  $sanitize: val => val,
}));

const renderWrapper = props =>
  shallow(
    (
      <PureOpenstackInstanceCheckoutSummary
        loading={false}
        loaded={true}
        translate={translate}
        {...props}
      />
    )
  );

describe('OpenstackInstanceCheckoutSummary', () => {
  const dataWithFlavor = {...dataWithoutFlavor, formData: {...dataWithoutFlavor.formData, flavor}};

  it('should render right message if no flavor has been selected', () => {
    const wrapper = renderWrapper(dataWithoutFlavor);
    expect(wrapper.find('p#invalid-info').text()).toContain('Please select flavor to see price estimate.');
    expect(wrapper.find('p#invalid-info').text()).not.toContain('Resource configuration is invalid. Please fix errors in form.');
  });

  it('should render right message if resource configuration is invalid', () => {
    const wrapper = renderWrapper({...dataWithFlavor, components: null});
    expect(wrapper.find('p#invalid-info').text()).toContain('Resource configuration is invalid. Please fix errors in form.');
    expect(wrapper.find('p#invalid-info').text()).not.toContain('Please select flavor to see price estimate.');
  });

  it('should render Table and QuotaUsageBarChart if flavor has been selected', () => {
    const wrapper = renderWrapper(dataWithFlavor);
    expect(wrapper.find('p#invalid-info')).toHaveLength(0);
    expect(wrapper.find(Table)).toHaveLength(1);
    expect(wrapper.find(QuotaUsageBarChart)).toHaveLength(1);
  });
});
