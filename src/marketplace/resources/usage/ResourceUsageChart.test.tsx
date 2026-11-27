import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ResourceUsageChart } from './ResourceUsageChart';

const ram = {
  type: 'ram',
  name: 'RAM',
  measured_unit: 'GB',
  billing_type: 'limit',
  factor: 1024,
} as any;

const FOOTNOTE = 'The dashed lines show current usage and the current limit.';

const renderChart = (context?) =>
  render(
    <ResourceUsageChart
      offeringComponent={ram}
      usages={[]}
      userUsages={[]}
      months={1}
      chartColor="#1f77b4"
      context={context}
    />,
  );

describe('ResourceUsageChart', () => {
  it('explains the dashed lines when it draws them', () => {
    const { container } = renderChart({
      offeringType: 'OpenStack.Tenant',
      currentUsage: 88064,
      currentLimit: 131072,
    });

    expect(container.textContent).toContain(FOOTNOTE);
  });

  it('says nothing about dashed lines on a chart without them', () => {
    const { container } = renderChart({ offeringType: 'OpenStack.Tenant' });

    expect(container.textContent).not.toContain(FOOTNOTE);
  });
});
