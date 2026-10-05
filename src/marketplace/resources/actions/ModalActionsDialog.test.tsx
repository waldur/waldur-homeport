import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BootstrapModalContext from 'react-bootstrap/ModalContext';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ActionItem } from '@/resource/actions/ActionItem';

import { ActionGroup } from './ActionGroup';
import { ModalActionsDialog } from './ModalActionsDialog';

describe('ModalActionsDialog', () => {
  beforeAll(() => {
    // downshift scrolls the highlighted row into view; jsdom has no layout.
    Element.prototype.scrollIntoView = vi.fn();
  });

  const startAction = vi.fn();
  const stopAction = vi.fn();
  const restartAction = vi.fn();
  const changePlanAction = vi.fn();
  const onHide = vi.fn();

  const MockActionsList = (props) => (
    <>
      <ActionGroup title="Resource actions">
        <ActionItem title="Start" action={startAction} {...props} />
        <ActionItem title="Stop" action={stopAction} {...props} />
        <ActionItem
          title="Restart"
          action={restartAction}
          disabled
          tooltip="Cannot restart while shut down"
          {...props}
        />
      </ActionGroup>
      <ActionGroup title="Billing actions">
        <ActionItem title="Change plan" action={changePlanAction} {...props} />
      </ActionGroup>
    </>
  );

  const renderDialog = () =>
    render(
      <BootstrapModalContext.Provider value={{ onHide }}>
        <ModalActionsDialog
          name="Production Web"
          refetch={vi.fn()}
          ActionsList={MockActionsList}
          resource={{ uuid: 'res-1' }}
          marketplaceResource={{
            uuid: 'res-1',
            name: 'Production Web',
            category_title: 'Virtual Machines',
            state: 'OK',
          }}
        />
      </BootstrapModalContext.Provider>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const highlighted = (input: HTMLElement) =>
    screen
      .queryAllByRole('option')
      .find(
        (option) => option.id === input.getAttribute('aria-activedescendant'),
      );

  it('renders a header with title, badge and close button', async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Production Web',
    );
    expect(screen.getByText('OK')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Close' });
    await user.click(closeBtn);
    expect(onHide).toHaveBeenCalled();
  });

  it('renders a combobox listbox and highlights the first option by default', async () => {
    renderDialog();
    const input = screen.getByRole('combobox', { name: 'Search actions' });
    expect(input).toHaveFocus();

    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(4));
    expect(highlighted(input)).toHaveTextContent('Start');
  });

  it('navigates through options with ArrowDown and ArrowUp without wrapping', async () => {
    const user = userEvent.setup();
    renderDialog();
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(4));

    expect(highlighted(input)).toHaveTextContent('Start');

    // ArrowUp at top stays at top
    await user.keyboard('{ArrowUp}');
    expect(highlighted(input)).toHaveTextContent('Start');

    await user.keyboard('{ArrowDown}');
    expect(highlighted(input)).toHaveTextContent('Stop');

    await user.keyboard('{ArrowDown}');
    expect(highlighted(input)).toHaveTextContent('Restart');

    await user.keyboard('{ArrowDown}');
    expect(highlighted(input)).toHaveTextContent('Change plan');

    // ArrowDown at bottom stays at bottom
    await user.keyboard('{ArrowDown}');
    expect(highlighted(input)).toHaveTextContent('Change plan');

    // ArrowUp moves back
    await user.keyboard('{ArrowUp}');
    expect(highlighted(input)).toHaveTextContent('Restart');
  });

  it('executes the highlighted option on Enter', async () => {
    const user = userEvent.setup();
    renderDialog();
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(4));
    expect(input).toHaveFocus();

    await user.keyboard('{ArrowDown}{Enter}');
    expect(stopAction).toHaveBeenCalled();
  });

  it('does not execute a disabled option on Enter', async () => {
    const user = userEvent.setup();
    renderDialog();
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(4));

    // Move to "Restart" (disabled)
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(highlighted(input)).toHaveTextContent('Restart');

    await user.keyboard('{Enter}');
    expect(restartAction).not.toHaveBeenCalled();
  });

  it('filters actions by search query and announces count in live region', async () => {
    const user = userEvent.setup();
    renderDialog();
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(4));

    await user.type(input, 'plan');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    expect(screen.getByRole('status')).toHaveTextContent('Actions found: 1');
    expect(highlighted(input)).toHaveTextContent('Change plan');

    await user.keyboard('{Enter}');
    expect(changePlanAction).toHaveBeenCalled();
  });

  it('shows empty state when no actions match and restores on clear', async () => {
    const user = userEvent.setup();
    renderDialog();
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(4));

    await user.type(input, 'unknown action');
    await waitFor(() =>
      expect(screen.getByText('No actions found')).toBeInTheDocument(),
    );
    expect(screen.getByRole('status')).toHaveTextContent('Actions found: 0');

    // Click clear search button
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(4));
    expect(input).toHaveValue('');
  });

  it('closes dialog on Escape when focus is inside the filter box', async () => {
    const user = userEvent.setup();
    renderDialog();
    const input = screen.getByRole('combobox');
    expect(input).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(onHide).toHaveBeenCalled();
  });

  it('scrolls highlighted action into view on arrow navigation', async () => {
    const user = userEvent.setup();
    renderDialog();
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(4));

    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled(),
    );
    vi.clearAllMocks();

    await user.keyboard('{ArrowDown}');
    expect(highlighted(input)).toHaveTextContent('Stop');
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
