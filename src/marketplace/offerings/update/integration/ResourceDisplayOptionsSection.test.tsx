import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ResourceDisplayOptionsSection } from './ResourceDisplayOptionsSection';

// The edit dialog starts from the value the button hands it; expose that.
vi.mock('@/form/FieldEditButton', () => ({
  FieldEditButton: ({ name, scope }: any) => (
    <button
      type="button"
      data-testid={`edit-${name}`}
      data-value={name
        .split('.')
        .reduce((value: any, key: string) => value?.[key], scope)}
    />
  ),
}));

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

// The value definition of an edit field, associated with its label term.
const shownValue = (label: string) =>
  screen.getByRole('definition', { name: new RegExp(`^${label}`) });

describe('ResourceDisplayOptionsSection', () => {
  // Per-key governance is a site-agent option; the agent carries out the
  // commands it allows.
  it('offers per-key API key management on a site-agent offering', () => {
    renderSection('Marketplace.SiteAgent');
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
    renderSection('Marketplace.SiteAgent');
    expect(screen.queryByText(KEY_LIMITS)).not.toBeInTheDocument();
    expect(screen.queryByText(DAILY_USAGE)).not.toBeInTheDocument();
  });

  it('shows the key limit options as the backend reads them when unset', () => {
    renderSection('Marketplace.SiteAgent', {
      enable_api_key_provisioning: true,
    });
    expect(shownValue(KEY_LIMITS)).toHaveTextContent(/Enabled$/);
    expect(shownValue(DAILY_USAGE)).toHaveTextContent(/Disabled$/);
  });

  it('shows the key limit options as stored', () => {
    renderSection('Marketplace.SiteAgent', {
      enable_api_key_provisioning: true,
      api_key_limits: false,
      api_key_daily_usage: true,
    });
    expect(shownValue(KEY_LIMITS)).toHaveTextContent(/Disabled$/);
    expect(shownValue(DAILY_USAGE)).toHaveTextContent(/Enabled$/);
  });

  // The bucket browser is opt-in per offering and off until enabled.
  it('offers the S3 bucket browser on a site-agent offering, off by default', () => {
    renderSection('Marketplace.SiteAgent');
    expect(shownValue('Enable S3 bucket browser')).toHaveTextContent(
      /Disabled$/,
    );
  });

  // The edit dialog starts from the same value the row shows, so an unset
  // gateway opens as the generic one rather than as an empty select.
  it('shows an unset S3 gateway as the generic one', () => {
    renderSection('Marketplace.SiteAgent', { enable_s3_browser: true });
    expect(shownValue('S3 gateway')).toHaveTextContent(
      /Other S3-compatible gateway$/,
    );
    expect(
      screen.getByTestId('edit-plugin_options.s3_browser_flavor'),
    ).toHaveAttribute('data-value', 'generic');
  });

  it('shows the S3 gateway as stored', () => {
    renderSection('Marketplace.SiteAgent', {
      enable_s3_browser: true,
      s3_browser_flavor: 'garage',
    });
    expect(shownValue('S3 gateway')).toHaveTextContent(/Garage$/);
    expect(
      screen.getByTestId('edit-plugin_options.s3_browser_flavor'),
    ).toHaveAttribute('data-value', 'garage');
  });

  it('does not offer the S3 bucket browser without a site agent', () => {
    renderSection('Marketplace.Basic');
    expect(
      screen.queryByText('Enable S3 bucket browser'),
    ).not.toBeInTheDocument();
  });
});
