import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ResourceDisplayOptionsSection } from './ResourceDisplayOptionsSection';

const renderSection = (type: string) =>
  renderWithProviders(
    <ResourceDisplayOptionsSection
      offering={{ uuid: 'offering-uuid', type, plugin_options: {} } as any}
      refetch={vi.fn()}
    />,
  );

describe('ResourceDisplayOptionsSection', () => {
  // Per-key governance is a site-agent option; the agent carries out the
  // commands it allows.
  it('offers per-key API key management on a site-agent offering', () => {
    renderSection('Marketplace.Slurm');
    expect(screen.getByText('Manage API keys one by one')).toBeInTheDocument();
  });

  it('does not offer it on an offering without a site agent', () => {
    renderSection('Marketplace.Basic');
    expect(screen.getByText('Hide API keys tab')).toBeInTheDocument();
    expect(
      screen.queryByText('Manage API keys one by one'),
    ).not.toBeInTheDocument();
  });
});
