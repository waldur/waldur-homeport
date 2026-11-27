import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsCheckConfigurationList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ConfigurationChecksDialog } from './ConfigurationChecksDialog';

const renderDialog = () =>
  renderWithProviders(
    <ConfigurationChecksDialog
      resolve={{ offering: { uuid: 'offering-uuid', name: 'Alps' } }}
    />,
  );

describe('ConfigurationChecksDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      marketplaceProviderOfferingsCheckConfigurationList,
    ).mockResolvedValue({ data: [] } as any);
  });

  it('reports a consistent offering', async () => {
    renderDialog();
    expect(
      await screen.findByText('The checks found nothing to fix.'),
    ).toBeInTheDocument();
  });

  it('lists the findings of the consistency rules', async () => {
    vi.mocked(
      marketplaceProviderOfferingsCheckConfigurationList,
    ).mockResolvedValue({
      data: [
        {
          rule: 'slurm_component_tres',
          severity: 'error',
          field: 'components.0.type',
          message: 'storage is not a SLURM TRES.',
        },
      ],
    } as any);
    renderDialog();
    expect(
      await screen.findByText('storage is not a SLURM TRES.'),
    ).toBeInTheDocument();
    expect(screen.getByText('components.0.type')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The site agent cannot work with the offering as it is: fix the errors below.',
      ),
    ).toBeInTheDocument();
  });

  it('checks again on request', async () => {
    renderDialog();
    await screen.findByText('The checks found nothing to fix.');
    await userEvent.click(screen.getByTestId('configuration-recheck'));
    await screen.findByText('The checks found nothing to fix.');
    expect(
      marketplaceProviderOfferingsCheckConfigurationList,
    ).toHaveBeenCalledTimes(2);
  });
});
