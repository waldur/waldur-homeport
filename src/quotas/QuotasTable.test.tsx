import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { QuotasTable } from './QuotasTable';

vi.mock('@waldur/store/hooks', () => ({
  useTheme: () => 'light',
}));

vi.mock('@waldur/core/EChart', () => ({
  EChart: ({ options }) => (
    <div data-testid="echart">{JSON.stringify(options)}</div>
  ),
}));

const renderQuotas = (quotas) => render(<QuotasTable resource={{ quotas }} />);

describe('QuotasTable', () => {
  it('should render empty state message when no quotas', () => {
    renderQuotas([]);
    expect(screen.getByText('You have no quotas yet.')).toBeInTheDocument();
  });

  it('should render categorized quotas', () => {
    const quotas = [
      {
        name: 'ram',
        usage: 1024,
        limit: 2048,
      },
      {
        name: 'vcpu',
        usage: 2,
        limit: 4,
      },
    ];

    renderQuotas(quotas);
    expect(screen.getByText('Compute')).toBeInTheDocument();
    expect(screen.getByText('RAM')).toBeInTheDocument();
    expect(screen.getByText('vCPU count')).toBeInTheDocument();
  });

  it('should render additional quotas section for uncategorized quotas', () => {
    const quotas = [
      {
        name: 'custom_quota',
        usage: 5,
        limit: 10,
      },
    ];

    renderQuotas(quotas);
    expect(screen.getByText('Additional quotas')).toBeInTheDocument();
    expect(screen.getByText('Custom quota:')).toBeInTheDocument();
  });

  it('should handle infinite limits', () => {
    const quotas = [
      {
        name: 'unlimited_quota',
        usage: 5,
        limit: -1,
      },
    ];

    renderQuotas(quotas);
    expect(screen.getByText('5 of ∞')).toBeInTheDocument();
  });

  it('should match quotas using regex patterns', () => {
    const quotas = [
      {
        name: 'gigabytes_custom',
        usage: 5,
        limit: 10,
      },
    ];

    renderQuotas(quotas);
    expect(screen.getByText('Storage')).toBeInTheDocument(); // Should be under Storage category
  });

  it('should sort quotas alphabetically within categories', () => {
    const quotas = [
      { name: 'vcpu', usage: 2, limit: 4 },
      { name: 'ram', usage: 1024, limit: 2048 },
    ];

    renderQuotas(quotas);
    const items = screen.getAllByText(/RAM|vCPU count/);
    expect(items[0]).toHaveTextContent('RAM');
    expect(items[1]).toHaveTextContent('vCPU count');
  });
});
