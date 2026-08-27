import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ScriptIntegrationSummary } from './ScriptIntegrationSummary';

const renderSummary = (offering) =>
  renderWithProviders(
    <ScriptIntegrationSummary
      offering={offering as any}
      refetch={vi.fn()}
      loading={false}
    />,
  );

describe('ScriptIntegrationSummary', () => {
  it('renders the configured scripts', () => {
    renderSummary({
      uuid: 'offering-uuid',
      secret_options: { language: 'python', create: 'echo hi' },
    });

    expect(screen.getByText('Provisioning configuration')).toBeInTheDocument();
    expect(screen.getByText('python')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Edit environment variables/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('compact-edit-button')).toHaveLength(5);
  });

  // The backend drops secret_options entirely for a user who may not see it —
  // a support member of the provider organization, say — and the section used
  // to throw while rendering, taking the whole tab down with it.
  it('renders without secret_options and offers no editing', () => {
    renderSummary({ uuid: 'offering-uuid' });

    expect(screen.getByText('Provisioning configuration')).toBeInTheDocument();
    expect(screen.getByText('Script language')).toBeInTheDocument();
    expect(screen.queryByText('Enabled')).not.toBeInTheDocument();
    expect(screen.queryByText('Disabled')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Edit environment variables/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('compact-edit-button')).toHaveLength(0);
  });
});
