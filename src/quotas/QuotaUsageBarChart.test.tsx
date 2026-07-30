import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { quotas } from '@/openstack/openstack-instance/storyFixtures';
import {
  exceeds,
  getSummary,
  getExisting,
  getPlanned,
  getAvailable,
  ProgressTooltipMessage,
  QuotaUsageBarChartDescription,
} from '@/quotas/QuotaUsageBarChart';

describe('exceeds', () => {
  it("should return false if quota's usage and required sum is less than limit", () => {
    const quota = quotas[0];
    expect(exceeds(quota)).toEqual(false);
  });

  it("should return true if quota's usage and required sum exceeds limit", () => {
    const quota = quotas[1];
    expect(exceeds(quota)).toEqual(true);
  });
});

describe('getSummary', () => {
  it('includes existing and planned usage in the summary', () => {
    expect(getSummary(quotas[0])).toEqual('4 of 80 used');
  });

  it('reflects planned usage when nothing is used yet', () => {
    expect(
      getSummary({
        name: 'vcpu',
        usage: 0,
        limit: 8,
        required: 4,
      }),
    ).toEqual('4 of 8 used');
  });
});

describe('getExisting', () => {
  it('should return right message', () => {
    expect(getExisting(quotas[0])).toEqual('Existing quota usage: 2');
  });
});

describe('getPlanned', () => {
  it('should return right message', () => {
    expect(getPlanned(quotas[0])).toEqual('Planned quota usage: 2');
  });
});

describe('getAvailable', () => {
  it('subtracts existing and planned usage from the limit', () => {
    expect(getAvailable(quotas[0])).toEqual('Available quota usage: 76');
  });
});

describe('ProgressTooltipMessage', () => {
  const renderWrapper = (props) =>
    render(<ProgressTooltipMessage {...props} />);

  it("should render danger message if quota's usage exceeds limit", () => {
    renderWrapper({ quota: quotas[1] });
    expect(
      screen.getByText('Quota usage exceeds available limit.'),
    ).toBeInTheDocument();
  });

  it("should not render danger message if quota's usage does not exceed limit", () => {
    renderWrapper({ quota: quotas[0] });
    expect(
      screen.queryByText('Quota usage exceeds available limit.'),
    ).not.toBeInTheDocument();
  });
});

describe('QuotaUsageBarChartDescription', () => {
  const renderWrapper = (props) =>
    render(<QuotaUsageBarChartDescription {...props} />);

  it("should render danger message if quota's usage exceeds limit", () => {
    renderWrapper({ quota: quotas[1] });
    expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();
  });

  it("should not render danger message if quota's usage does not exceed limit", () => {
    renderWrapper({ quota: quotas[0] });
    expect(screen.queryByTestId('WarningIcon')).not.toBeInTheDocument();
  });
});
