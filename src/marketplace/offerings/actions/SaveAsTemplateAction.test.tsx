import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsSaveAsTemplate } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { SaveAsTemplateAction } from './SaveAsTemplateAction';
import { SaveAsTemplateDialog } from './SaveAsTemplateDialog';

const siteAgentOffering = {
  uuid: 'offering-uuid',
  name: 'HPC',
  type: 'Marketplace.SiteAgent',
} as any;

const render = ({
  user = { is_staff: true },
  row = siteAgentOffering,
} = {}) => {
  vi.mocked(workspaceHooks.useUser).mockReturnValue(user as any);
  return renderWithProviders(
    inActionsMenu(<SaveAsTemplateAction row={row} refetch={vi.fn()} />),
  );
};

const isVisible = () => screen.queryByText('Save as template') !== null;

describe('SaveAsTemplateAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('is offered to staff on a site-agent offering', () => {
    render();
    expect(isVisible()).toBe(true);
  });

  it('is offered for the former site-agent type too', () => {
    render({ row: { ...siteAgentOffering, type: 'Marketplace.Slurm' } });
    expect(isVisible()).toBe(true);
  });

  it('is hidden from non-staff users', () => {
    render({ user: { is_staff: false } });
    expect(isVisible()).toBe(false);
  });

  it('is hidden when there is no user', () => {
    render({ user: null });
    expect(isVisible()).toBe(false);
  });

  it('is hidden for an offering that is not run by the site agent', () => {
    render({ row: { ...siteAgentOffering, type: 'OpenStack.Tenant' } });
    expect(isVisible()).toBe(false);
  });
});

describe('SaveAsTemplateDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('saves the offering under the given name and points to the templates', async () => {
    vi.mocked(marketplaceProviderOfferingsSaveAsTemplate).mockResolvedValue({
      data: { uuid: 'template-uuid', name: 'HPC template' },
    } as any);
    const user = userEvent.setup();
    renderWithProviders(
      <SaveAsTemplateDialog resolve={{ offering: siteAgentOffering }} />,
    );

    const name = screen.getByDisplayValue('HPC');
    await user.clear(name);
    await user.type(name, 'HPC template');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(marketplaceProviderOfferingsSaveAsTemplate).toHaveBeenCalledWith({
        path: { uuid: 'offering-uuid' },
        body: { name: 'HPC template' },
      }),
    );
    await waitFor(() =>
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Offering template HPC template created.',
        expect.any(String),
        {
          actions: [
            expect.objectContaining({ label: 'Open offering templates' }),
          ],
        },
      ),
    );
  });

  it('shows a refusal from the API on the name', async () => {
    vi.mocked(marketplaceProviderOfferingsSaveAsTemplate).mockRejectedValue({
      name: ['An offering template with this name already exists.'],
      status: 400,
      response: { status: 400 },
    });
    const user = userEvent.setup();
    renderWithProviders(
      <SaveAsTemplateDialog resolve={{ offering: siteAgentOffering }} />,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText(
        'An offering template with this name already exists.',
      ),
    ).toBeInTheDocument();
  });

  it('shows where in the document an API refusal points', async () => {
    vi.mocked(marketplaceProviderOfferingsSaveAsTemplate).mockRejectedValue({
      document: {
        agent_configuration: {
          backend_settings: { foo: ['This setting is required.'] },
        },
      },
      status: 400,
      response: { status: 400 },
    });
    const user = userEvent.setup();
    renderWithProviders(
      <SaveAsTemplateDialog resolve={{ offering: siteAgentOffering }} />,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText(
        'document.agent_configuration.backend_settings.foo: This setting is required.',
      ),
    ).toBeInTheDocument();
  });
});
