import { shallow } from 'enzyme';
import * as React from 'react';

import { quotas } from '@waldur/openstack/openstack-instance/storyFixtures';
import { exceeds } from '@waldur/quotas/QuotaUsageBarChart';
import { getSummary } from '@waldur/quotas/QuotaUsageBarChart';
import { getExisting } from '@waldur/quotas/QuotaUsageBarChart';
import { getPlanned } from '@waldur/quotas/QuotaUsageBarChart';
import { getAvailable } from '@waldur/quotas/QuotaUsageBarChart';
import { getExceeds } from '@waldur/quotas/QuotaUsageBarChart';

import { ProgressTooltipMessage, QuotaUsageBarChartDescription } from './QuotaUsageBarChart';

describe('exceeds', () => {
  it('should return false if quota\'s usage and required sum is less than limit', () => {
    const quota = quotas[0];
    expect(exceeds(quota)).toEqual(false);
  });

  it('should return true if quota\'s usage and required sum exceeds limit', () => {
    const quota = quotas[1];
    expect(exceeds(quota)).toEqual(true);
  });
});

describe('getSummary', () => {
  it('should return right message', () => {
    const expected = '2 of 80 used';
    expect(getSummary(quotas[0])).toEqual(expected);
  });
});

describe('getExisting', () => {
  it('should return right message', () => {
    const expected = 'Existing quota usage: 2';
    expect(getExisting(quotas[0])).toEqual(expected);
  });
});

describe('getPlanned', () => {
  it('should return right message', () => {
    const expected = 'Planned quota usage: 2';
    expect(getPlanned(quotas[0])).toEqual(expected);
  });
});

describe('getAvailable', () => {
  it('should return right message', () => {
    const expected = 'Available quota usage: 78';
    expect(getAvailable(quotas[0])).toEqual(expected);
  });
});

describe('getExceeds', () => {
  it('should return right message', () => {
    const expected = 'Package amount quota usage exceeds available limit.';
    expect(getExceeds(quotas[0])).toEqual(expected);
  });
});

describe('ProgressTooltipMessage', () => {
  const renderWrapper = props =>
    shallow(
      <ProgressTooltipMessage {...props}/>
    );

  it('should render danger message if quota\'s usage exceeds limit', () => {
    const wrapper = renderWrapper({quota: quotas[1]});
    const expectedMessage = 'Package amount quota usage exceeds available limit.';
    expect(wrapper.find('.text-danger').text()).toContain(expectedMessage);
  });

  it('should not render danger message if quota\'s usage does not exceed limit', () => {
    const wrapper = renderWrapper({quota: quotas[0]});
    expect(wrapper.find('.text-danger')).toHaveLength(0);
  });
});

describe('QuotaUsageBarChartDescription', () => {
  const renderWrapper = props =>
    shallow(
      <QuotaUsageBarChartDescription {...props}/>
    );

  it('should render danger message if quota\'s usage exceeds limit', () => {
    const wrapper = renderWrapper({quota: quotas[1]});
    expect(wrapper.find('.fa-exclamation-triangle')).toHaveLength(1);
  });

  it('should not render danger message if quota\'s usage does not exceed limit', () => {
    const wrapper = renderWrapper({quota: quotas[0]});
    expect(wrapper.find('.fa-exclamation-triangle')).toHaveLength(0);
  });
});
