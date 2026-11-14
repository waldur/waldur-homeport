import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notificationMessagesTemplatesOverride } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { NotificationUpdateDialog } from './NotificationUpdateDialog';

const notification = {
  uuid: 'notification-uuid',
  key: 'users.invitation_created',
  description: 'Invitation has been created.',
  context_schema: { properties: {} },
  templates: [
    {
      uuid: 'subject-uuid',
      path: 'users/invitation_created_subject.txt',
      content: null,
      original_content: 'Invitation',
      is_content_overridden: false,
    },
    {
      uuid: 'footer-uuid',
      path: 'users/invitation_created_footer.txt',
      content: null,
      original_content: 'Regards',
      is_content_overridden: false,
    },
  ],
} as any;

const renderDialog = () =>
  renderWithProviders(
    <NotificationUpdateDialog resolve={{ notification, refetch: vi.fn() }} />,
  );

describe('NotificationUpdateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(notificationMessagesTemplatesOverride).mockResolvedValue(
      {} as any,
    );
  });

  // Each template was matched against any template with the same text, so an
  // edit equal to another template's text counted as unchanged and was lost.
  it('saves an edit whose text equals another template', async () => {
    const user = userEvent.setup();
    renderDialog();

    const subject = screen.getByDisplayValue('Invitation');
    await user.clear(subject);
    await user.type(subject, 'Regards');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(notificationMessagesTemplatesOverride).toHaveBeenCalledTimes(1),
    );
    expect(notificationMessagesTemplatesOverride).toHaveBeenCalledWith({
      path: { uuid: 'subject-uuid' },
      body: { content: 'Regards' },
    });
  });

  it('sends only the template that was changed', async () => {
    const user = userEvent.setup();
    renderDialog();

    const subject = screen.getByDisplayValue('Invitation');
    await user.type(subject, ' for you');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(notificationMessagesTemplatesOverride).toHaveBeenCalledTimes(1),
    );
    expect(notificationMessagesTemplatesOverride).toHaveBeenCalledWith({
      path: { uuid: 'subject-uuid' },
      body: { content: 'Invitation for you' },
    });
  });
});
