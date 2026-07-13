import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OpenStackFloatingIpSummary } from './OpenStackFloatingIpSummary';

const renderSummary = (resource) =>
  render(<OpenStackFloatingIpSummary resource={resource} />);

describe('OpenStackFloatingIpSummary', () => {
  it('shows the 1:1 NAT public IP when external_address is set', () => {
    renderSummary({
      runtime_state: 'ACTIVE',
      backend_id: 'fip-backend-1',
      external_address: '195.80.105.110',
    });

    expect(screen.getByText(/^Public IP:$/)).toBeInTheDocument();
    expect(screen.getByText('195.80.105.110')).toBeInTheDocument();
  });

  it('hides the 1:1 NAT public IP when external_address is empty', () => {
    renderSummary({
      runtime_state: 'ACTIVE',
      backend_id: 'fip-backend-1',
      external_address: null,
    });

    expect(screen.queryByText(/^Public IP:$/)).not.toBeInTheDocument();
  });
});
