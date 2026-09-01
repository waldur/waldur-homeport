import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Issue, supportIssuesSetStatus } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { ChangeStatusButton } from './ChangeStatusButton';

const issue = {
  uuid: 'issue-1',
  key: 'WLD-ABC',
  summary: 'Printer on fire',
  available_statuses: ['In progress', 'Resolved'],
  update_is_available: true,
} as unknown as Issue;

const renderButton = (overrides: Partial<Issue> = {}) =>
  renderWithProviders(
    <ChangeStatusButton
      issue={{ ...issue, ...overrides } as Issue}
      refetch={vi.fn()}
    />,
  );

describe('ChangeStatusButton', () => {
  beforeEach(() => vi.clearAllMocks());

  it('offers the statuses the backend reports', () => {
    renderButton();
    expect(
      screen.getByRole('button', { name: 'Change status' }),
    ).toBeInTheDocument();
  });

  // A remote service desk owns the status of its own tickets, so the backend
  // reports no available statuses for the Jira, Zammad and SMAX backends. That
  // is what keeps this control off those deployments.
  it('renders nothing when the backend offers no statuses', () => {
    const { container } = renderButton({ available_statuses: [] } as any);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when available_statuses is absent', () => {
    const { container } = renderButton({
      available_statuses: undefined,
    } as any);
    expect(container).toBeEmptyDOMElement();
  });

  it('is disabled with a reason when the issue cannot be updated', () => {
    renderButton({ update_is_available: false } as any);
    expect(
      screen.getByRole('button', { name: 'Change status' }),
    ).toBeDisabled();
  });

  it('submits the chosen status', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(supportIssuesSetStatus).mockResolvedValue({} as any);

    // The button opens the dialog through the modal service, which is mocked;
    // render the dialog the way the service would.
    renderButton();
    await user.click(screen.getByRole('button', { name: 'Change status' }));
    const [DialogComponent, props] = vi.mocked(useModal().openDialog).mock
      .calls[0] as any;
    renderWithProviders(
      <DialogComponent resolve={{ ...props.resolve, refetch }} />,
    );

    await openAndSelectOption(user, 'New status', 'Resolved');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(supportIssuesSetStatus).toHaveBeenCalledWith({
        path: { uuid: 'issue-1' },
        body: { status: 'Resolved' },
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});
