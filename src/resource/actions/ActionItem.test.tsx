import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ResourceActionMenuContext } from '@/marketplace/resources/actions/ResourceActionMenuContext';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { ActionItem } from './ActionItem';

/**
 * Regression test for a real production crash: ActionItem defaults to
 * ActionsDropdownItem (a real RadixDropdownMenu.Item), which throws
 * "`MenuItem` must be used within `Menu`" outside a Menu Root/Content.
 * ModalActionsDialog's "show all actions" search results
 * (marketplace/resources/actions/ActionDialogBody.tsx) render actions
 * inside a plain react-bootstrap Modal, not a Radix panel — caught live
 * in production via ForceDestroyAction, an ordinary ActionItemType action
 * that also happens to be listed there. ActionDialogBody now marks its
 * ResourceActionMenuContext with `notInMenu: true`, which ActionItem
 * reads to switch to PlainActionItem (zero Radix dependency) instead.
 */
describe('ActionItem renders correctly in both of its real host contexts', () => {
  it('inside a real ActionsDropdownComponent menu: default ActionsDropdownItem', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(
      <ActionsDropdownComponent labeled label="Actions">
        <ActionItem title="Force destroy" action={action} />
      </ActionsDropdownComponent>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    const row = await screen.findByText('Force destroy');
    await user.click(row);
    expect(action).toHaveBeenCalled();
  });

  it('notInMenu (ModalActionsDialog): no Radix ancestor at all', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    expect(() =>
      render(
        <ResourceActionMenuContext.Provider
          value={{ query: '', notInMenu: true }}
        >
          <ActionItem title="Force destroy" action={action} />
        </ResourceActionMenuContext.Provider>,
      ),
    ).not.toThrow();
    await user.click(screen.getByText('Force destroy'));
    expect(action).toHaveBeenCalled();
  });
});
