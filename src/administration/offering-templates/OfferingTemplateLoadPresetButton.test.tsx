import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceOfferingTemplatesLoadPreset,
  marketplaceOfferingTemplatesPresetsList,
  OfferingTemplatePreset,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { OfferingTemplateLoadPresetDialog } from './OfferingTemplateLoadPresetButton';

const presets: OfferingTemplatePreset[] = [
  {
    key: 'slurm',
    name: 'SLURM cluster',
    description: 'A SLURM cluster run by the site agent.',
    offering_type: 'Marketplace.SiteAgent',
    parameters: [
      {
        key: 'partition',
        label: 'Partition',
        description: '',
        type: 'string',
        required: true,
        default: null,
        paths: ['offering.backend_id'],
      },
    ],
    name_taken: true,
  },
  {
    key: 'litellm',
    name: 'LiteLLM gateway',
    description: 'Language models behind a LiteLLM proxy.',
    offering_type: 'Marketplace.SiteAgent',
    parameters: [],
    name_taken: false,
  },
];

const renderDialog = () =>
  renderWithProviders(
    <OfferingTemplateLoadPresetDialog resolve={{ refetch: vi.fn() }} />,
  );

describe('OfferingTemplateLoadPresetDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceOfferingTemplatesPresetsList).mockResolvedValue({
      data: presets,
    } as any);
  });

  it('shows each preset key, the name load_preset takes', async () => {
    renderDialog();
    const keys = await screen.findAllByTestId('preset-key');
    expect(keys.map((key) => key.textContent)).toEqual(['slurm', 'litellm']);
  });

  it('disables a preset whose name a template already holds', async () => {
    renderDialog();
    const taken = await screen.findByRole('checkbox', {
      name: /SLURM cluster/,
    });
    expect(taken).toBeDisabled();
    expect(taken).not.toBeChecked();
    expect(screen.getByText('Name in use')).toBeInTheDocument();
    expect(screen.getByTestId('preset-name-taken')).toHaveTextContent(
      'An offering template named SLURM cluster already exists',
    );
    expect(
      screen.getByRole('checkbox', { name: /LiteLLM gateway/ }),
    ).toBeEnabled();
    expect(
      screen.getByText('Language models behind a LiteLLM proxy.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Load' })).toBeDisabled();
  });

  it('shows the parameters of a preset on request', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(
      await screen.findByRole('button', { name: 'Show parameters (1)' }),
    );
    expect(await screen.findByText('partition')).toBeInTheDocument();
    expect(screen.getByText('offering.backend_id')).toBeInTheDocument();
  });

  it('loads the selected presets', async () => {
    vi.mocked(marketplaceOfferingTemplatesLoadPreset).mockResolvedValue({
      data: { created: 1, created_names: ['LiteLLM gateway'] },
    } as any);
    const user = userEvent.setup();
    renderDialog();
    await user.click(
      await screen.findByRole('checkbox', { name: /LiteLLM gateway/ }),
    );
    await user.click(
      screen.getByRole('checkbox', { name: /Publish after loading/ }),
    );
    await user.click(screen.getByRole('button', { name: 'Load' }));

    await waitFor(() =>
      expect(marketplaceOfferingTemplatesLoadPreset).toHaveBeenCalledWith({
        body: { presets: ['litellm'], publish: true },
      }),
    );
    await waitFor(() =>
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Loaded 1 offering template.',
      ),
    );
  });
});
