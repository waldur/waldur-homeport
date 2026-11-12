import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as sdk from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';

import { daysBeforeLabel, triggerLabel } from './labels';
import { MailRulePane } from './MailRulePane';

// The SDK is mocked for every test (test/setupTests.js).

vi.mock('waldur-table/src/ActionsDropdown', () => ({
  ActionsDropdown: ({ children }) => <div>{children}</div>,
}));
vi.mock('@/resource/actions/ActionItem', () => ({
  ActionItem: ({ title, action }) => (
    <button type="button" onClick={action}>
      {title}
    </button>
  ),
}));

const step = {
  uuid: 'step-uuid',
  key: 'award_response',
  name: 'Award response',
  completer: 'applicant',
} as any;
const rule = {
  uuid: 'rule-uuid',
  workflow_step: 'step-uuid',
  step: 'award_response',
  trigger: 'step_started',
  recipient: 'call_managers',
  days_before: null,
  is_enabled: true,
  notified_proposal_roles: [],
  proposal_role: null,
  proposal_role_name: null,
} as any;

/** The pane in a dialog: its footer holds what the pane puts there. */
const Dialog = () => {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const [editing, setEditing] = useState(false);
  return (
    <>
      <MailRulePane
        callUuid="call-uuid"
        step={step}
        target={{
          step: 'award_response',
          trigger: 'step_started',
          recipient: 'call_managers',
        }}
        footerSlot={slot}
        onEditingChange={setEditing}
      />
      <footer data-testid="footer">
        <div ref={setSlot} />
        {!editing && <button type="button">Close</button>}
      </footer>
    </>
  );
};

describe('MailRulePane', () => {
  beforeEach(() => {
    vi.mocked(sdk.callWorkflowStepNotificationRulesList).mockResolvedValue({
      data: [rule],
    } as any);
    vi.mocked(sdk.rolesList).mockResolvedValue({ data: [] } as any);
    vi.mocked(sdk.proposalProtectedCallsProposalRolesList).mockResolvedValue({
      data: [],
    } as any);
  });

  it('shows the rule form in place of the list, with Save in the footer', async () => {
    renderWithProviders(
      <DrawerProvider>
        <Provider store={configureStore()({ tables: {} })}>
          <Dialog />
        </Provider>
      </DrawerProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));

    expect(await screen.findByTestId('mail-rule-form')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeVisible();
    expect(screen.getByText('Audience')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Back to rules' })).toBeVisible();
    const footer = screen.getByTestId('footer');
    const save = within(footer).getByTestId('mail-rule-save');
    expect(save).toBeVisible();
    // Nothing changed yet: Save waits for a change.
    expect(save).toBeDisabled();
    expect(
      within(footer).getByRole('button', { name: 'Cancel' }),
    ).toBeVisible();
    expect(within(footer).queryByRole('button', { name: 'Close' })).toBeNull();
    // The list is gone while the form shows.
    expect(screen.queryByRole('button', { name: 'Add' })).toBeNull();
  });

  it('goes back to the list on Cancel', async () => {
    renderWithProviders(
      <DrawerProvider>
        <Provider store={configureStore()({ tables: {} })}>
          <Dialog />
        </Provider>
      </DrawerProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    await userEvent.click(
      within(screen.getByTestId('footer')).getByRole('button', {
        name: 'Cancel',
      }),
    );
    await waitFor(() =>
      expect(screen.queryByTestId('mail-rule-form')).toBeNull(),
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
  });

  it('adds a rule from a form with an enabled Save', async () => {
    renderWithProviders(
      <DrawerProvider>
        <Provider store={configureStore()({ tables: {} })}>
          <Dialog />
        </Provider>
      </DrawerProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }));
    const save = within(screen.getByTestId('footer')).getByTestId(
      'mail-rule-save',
    );
    expect(save).toBeVisible();
    expect(save).toBeEnabled();
  });
});

describe('days before', () => {
  it('is singular for one day', () => {
    expect(daysBeforeLabel(1)).toBe('1 day before');
    expect(daysBeforeLabel(3)).toBe('3 days before');
    expect(triggerLabel('deadline_approaching', 1)).toBe(
      'Deadline approaching (1 day before)',
    );
  });
});
