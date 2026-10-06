import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  supportIssuesCreate,
  supportRequestTypesList,
  usersList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { router } from '@/router';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import {
  constructStaffRequestPayload,
  StaffRequestDialog,
  StaffRequestFormData,
} from './StaffRequestDialog';

const recipient = {
  uuid: 'user-2',
  url: 'http://example.com/api/users/user-2/',
  full_name: 'Jane Doe',
  email: 'jane@example.com',
};

const renderComponent = (resolve = {}) =>
  renderWithProviders(
    <StaffRequestDialog resolve={{ recipient, ...resolve }} />,
  );

describe('constructStaffRequestPayload', () => {
  it('names the recipient as caller and sends the message as first comment', () => {
    const payload = constructStaffRequestPayload({
      recipient,
      type: { id: 'Informational' },
      summary: 'Your SSH key',
      message: 'Please rotate it.',
    } as StaffRequestFormData);

    expect(payload).toEqual({
      type: 'Informational',
      summary: 'Your SSH key',
      caller: recipient.url,
      first_comment: 'Please rotate it.',
    });
  });

  // The caller sees only an unscoped request, and the backend attributes the
  // request to the sender as soon as is_reported_manually is set.
  it('sends no scope and no is_reported_manually', () => {
    const payload = constructStaffRequestPayload({
      recipient,
      type: { id: 'Incident' },
      summary: 'S',
      message: 'M',
    } as StaffRequestFormData);

    expect(payload).not.toHaveProperty('customer');
    expect(payload).not.toHaveProperty('project');
    expect(payload).not.toHaveProperty('resource');
    expect(payload).not.toHaveProperty('is_reported_manually');
  });
});

describe('StaffRequestDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    ENV.plugins.WALDUR_SUPPORT = {
      ENABLED: true,
      DISPLAY_REQUEST_TYPE: true,
    } as any;
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      uuid: 'user-1',
      is_staff: true,
    } as any);
    vi.mocked(supportRequestTypesList).mockResolvedValue({
      data: [
        { name: 'Informational', description: 'Info type', issue_type_id: 1 },
      ],
    } as any);
    vi.mocked(usersList).mockResolvedValue({ data: [] } as any);
  });

  it('prefills the recipient it was opened for', async () => {
    renderComponent();

    expect(
      await screen.findByText('Jane Doe (jane@example.com)'),
    ).toBeInTheDocument();
  });

  it('offers only active users as recipients', async () => {
    renderComponent();

    await waitFor(() => {
      expect(usersList).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ is_active: true }),
        }),
      );
    });
  });

  it('keeps Send disabled until subject and message are filled', async () => {
    renderComponent();

    const send = await screen.findByRole('button', { name: 'Send' });
    expect(send).toBeDisabled();

    await user.type(await screen.findByLabelText(/Subject/), 'Your SSH key');
    expect(send).toBeDisabled();

    await user.type(screen.getByLabelText(/Message/), 'Please rotate it.');
    expect(send).not.toBeDisabled();
  });

  it('creates the request and opens it', async () => {
    const refetch = vi.fn();
    vi.mocked(supportIssuesCreate).mockResolvedValue({
      data: { uuid: 'issue-100', key: 'SUP-100' },
    } as any);

    renderComponent({ refetch });

    await user.type(await screen.findByLabelText(/Subject/), 'Your SSH key');
    await user.type(screen.getByLabelText(/Message/), 'Please rotate it.');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(supportIssuesCreate).toHaveBeenCalledWith({
        body: {
          type: 'Informational',
          summary: 'Your SSH key',
          caller: recipient.url,
          first_comment: 'Please rotate it.',
        },
      });
    });
    await waitFor(() => {
      expect(router.stateService.go).toHaveBeenCalledWith('support.detail', {
        issue_uuid: 'issue-100',
      });
    });
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Request SUP-100 has been created.',
    );
    expect(refetch).toHaveBeenCalled();
  });

  it('refuses the sender as recipient', async () => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      uuid: recipient.uuid,
      is_staff: true,
    } as any);

    renderComponent();

    await user.type(await screen.findByLabelText(/Subject/), 'S');
    await user.type(screen.getByLabelText(/Message/), 'M');

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('warns instead of showing the form when no request types exist', async () => {
    vi.mocked(supportRequestTypesList).mockResolvedValue({ data: [] } as any);

    renderComponent();

    expect(
      await screen.findByText('Service desk configuration incomplete'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Subject/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });
});
