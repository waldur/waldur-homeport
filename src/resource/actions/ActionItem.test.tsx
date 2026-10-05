import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ActionList } from '@/marketplace/resources/actions/ActionList';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { ActionItem } from './ActionItem';

/**
 * Regression test for a real production crash: ActionItem defaults to
 * Menu.Item (which outside a panel falls back to a plain button row),
 * preventing crashes outside a Menu Root/Content.
 * ModalActionsDialog's "show all actions" search results
 * (marketplace/resources/actions/ActionDialogBody.tsx) render actions
 * inside a plain react-bootstrap Modal, not a Radix panel — caught live
 * in production via ForceDestroyAction, an ordinary ActionItemType action
 * that also happens to be listed there. Menu.Item renders a
 * plain button when no menu panel is around it: the dialog is no menu.
 */
describe('ActionItem renders correctly in both of its real host contexts', () => {
  it('inside a real ActionsMenu menu: default Menu.Item', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(
      <ActionsMenu toggle="labeled" label="Actions">
        <ActionItem title="Force destroy" action={action} />
      </ActionsMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    const row = await screen.findByText('Force destroy');
    await user.click(row);
    expect(action).toHaveBeenCalled();
  });

  it('in ModalActionsDialog: no Radix ancestor at all', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    expect(() =>
      render(
        <ActionList>
          <ActionItem title="Force destroy" action={action} />
        </ActionList>,
      ),
    ).not.toThrow();
    const row = screen.getByRole('button', { name: 'Force destroy' });
    expect(row.tagName).toBe('BUTTON');
    expect(row).toHaveAttribute('data-testid', 'action-item');
    await user.click(row);
    expect(action).toHaveBeenCalled();
  });

  it('describes a disabled action by its reason and a staff action as such', () => {
    render(
      <ActionList>
        <ActionItem
          title="Start"
          action={vi.fn()}
          disabled
          tooltip="Instance is already active"
          staff
        />
      </ActionList>,
    );
    expect(
      screen.getByRole('button', { name: 'Start' }),
    ).toHaveAccessibleDescription('Instance is already active. Staff action');
  });
});
