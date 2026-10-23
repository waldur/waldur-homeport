import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ResourceDisplayOptionsSection } from './ResourceDisplayOptionsSection';

const renderSection = (
  type: string,
  plugin_options: Record<string, unknown> = {},
) =>
  renderWithProviders(
    <ResourceDisplayOptionsSection
      offering={{ uuid: 'offering-uuid', type, plugin_options } as any}
      refetch={vi.fn()}
    />,
  );

const KEY_LIMITS = 'Let users limit API keys';
const DAILY_USAGE = 'Site agent reports API key usage per day';

// The row of an edit field: its label, description and value.
const shownValue = (label: string) =>
  screen.getByRole('row', { name: new RegExp(`^${label}`) });

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

  // Both only mean something while keys are managed one by one.
  it('offers the key limit options only with key management on', () => {
    renderSection('Marketplace.Slurm');
    expect(screen.queryByText(KEY_LIMITS)).not.toBeInTheDocument();
    expect(screen.queryByText(DAILY_USAGE)).not.toBeInTheDocument();
  });

  it('shows the key limit options as the backend reads them when unset', () => {
    renderSection('Marketplace.Slurm', { enable_api_key_provisioning: true });
    expect(shownValue(KEY_LIMITS)).toHaveTextContent(/Enabled$/);
    expect(shownValue(DAILY_USAGE)).toHaveTextContent(/Disabled$/);
  });

  it('shows the key limit options as stored', () => {
    renderSection('Marketplace.Slurm', {
      enable_api_key_provisioning: true,
      api_key_limits: false,
      api_key_daily_usage: true,
    });
    expect(shownValue(KEY_LIMITS)).toHaveTextContent(/Disabled$/);
    expect(shownValue(DAILY_USAGE)).toHaveTextContent(/Enabled$/);
  });
});
