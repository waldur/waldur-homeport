import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourcesList,
  matrixTicketDraftsCreateIssue,
  supportRequestTypesList,
  supportTemplatesList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import {
  clearSelect,
  getSelectByLabel,
  openAndSelectOption,
} from '@/test/select';
import { mockListResponse } from '@/test/utils';
import * as workspaceHooks from '@/workspace/hooks';

import { TicketDraft } from './parseTicketDraft';
import { TicketDraftEditDialog } from './TicketDraftEditDialog';

// The real support form, opened from a draft that names a resource.

ENV.plugins.WALDUR_SUPPORT = {
  ENABLED: true,
  DISPLAY_REQUEST_TYPE: true,
} as any;

const draft: TicketDraft = {
  draftUuid: 'd1',
  requester: '@alice:chat.example.com',
  title: 'VM does not boot',
  description: 'It hangs.',
  requestType: 'Incident',
  project: {
    uuid: 'p1',
    name: 'Project',
    customerUuid: 'c1',
    customerName: 'Org',
  },
  resource: { uuid: 'r1', name: 'vm-1', offeringName: 'VMs' },
};

const RESOURCES = [
  { uuid: 'r1', name: 'vm-1', offering_name: 'VMs', project_uuid: 'p1' },
  { uuid: 'r2', name: 'vm-2', offering_name: 'VMs', project_uuid: 'p1' },
];

const submit = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTestId('next-button-step-0'));
  await user.click(await screen.findByTestId('confirm-button'));
};

describe('editing a ticket draft in the support form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      uuid: 'user-1',
    } as any);
    vi.mocked(supportRequestTypesList).mockResolvedValue({
      data: [{ name: 'Incident' }, { name: 'Informational' }],
    } as any);
    vi.mocked(supportTemplatesList).mockResolvedValue({ data: [] } as any);
    vi.mocked(marketplaceResourcesList).mockResolvedValue(
      mockListResponse(RESOURCES),
    );
    vi.mocked(matrixTicketDraftsCreateIssue).mockResolvedValue({
      data: { issue_key: 'SD-1', issue_uuid: 'i1', issue_url: '/x' },
    } as any);
  });

  const renderForm = (overrides: Partial<TicketDraft> = {}) =>
    renderWithProviders(
      <TicketDraftEditDialog
        resolve={{
          draft: { ...draft, ...overrides },
          onCreated: vi.fn(),
          onFailed: vi.fn(),
        }}
      />,
    );

  it('preselects the bot’s resource and lets the user pick another', async () => {
    const user = userEvent.setup();
    renderForm();
    expect(await screen.findByText('vm-1 (VMs)')).toBeInTheDocument();
    await openAndSelectOption(user, 'Affected resource', 'vm-2 (VMs)');
    await submit(user);
    await waitFor(() =>
      expect(matrixTicketDraftsCreateIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ resource_uuid: 'r2' }),
        }),
      ),
    );
  });

  it('lets the user clear the bot’s resource', async () => {
    const user = userEvent.setup();
    renderForm();
    await screen.findByText('vm-1 (VMs)');
    expect(await clearSelect(user, 'Affected resource')).toBe(true);
    expect(getSelectByLabel('Affected resource')).toBeInTheDocument();
    await submit(user);
    await waitFor(() =>
      expect(matrixTicketDraftsCreateIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ resource_uuid: null }),
        }),
      ),
    );
  });

  it('says the suggested priority goes into the description', async () => {
    const user = userEvent.setup();
    renderForm({ priority: 'High' });
    await screen.findByText('vm-1 (VMs)');
    await user.click(screen.getByTestId('next-button-step-0'));
    expect(
      await screen.findByText(
        'Suggested priority: High is added to the description for the helpdesk.',
      ),
    ).toBeInTheDocument();
  });

  it('says nothing of a priority the draft doesn’t suggest', async () => {
    const user = userEvent.setup();
    renderForm();
    await screen.findByText('vm-1 (VMs)');
    await user.click(screen.getByTestId('next-button-step-0'));
    expect(await screen.findByLabelText(/Request description/)).toBeVisible();
    expect(screen.queryByText(/^Suggested priority/)).toBeNull();
  });
});
