import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModalHideContext } from 'waldur-ui';

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
      <ModalHideContext.Provider value={onHide}>
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
      </ModalHideContext.Provider>,
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

  describe('group tabs', () => {
    const tab = (name: string) => screen.getByRole('tab', { name });

    it('opens on All, with every group shown', async () => {
      renderDialog();
      await waitFor(() => expect(tab('All')).toBeInTheDocument());
      expect(tab('All')).toHaveAttribute('aria-selected', 'true');
      expect(tab('Resource actions')).toBeInTheDocument();
      expect(tab('Billing actions')).toBeInTheDocument();
      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.getByText('Change plan')).toBeInTheDocument();
    });

    it('narrows the list and the keyboard navigation to one group', async () => {
      const user = userEvent.setup();
      renderDialog();
      await waitFor(() => expect(tab('Billing actions')).toBeInTheDocument());

      await user.click(tab('Billing actions'));
      await waitFor(() =>
        expect(screen.getAllByRole('option')).toHaveLength(1),
      );
      expect(screen.getByText('Change plan')).toBeInTheDocument();
      expect(screen.queryByText('Start')).not.toBeInTheDocument();

      await user.click(tab('All'));
      await waitFor(() =>
        expect(screen.getAllByRole('option')).toHaveLength(4),
      );
    });

    it('searches every group, and restores the picked tab afterwards', async () => {
      const user = userEvent.setup();
      renderDialog();
      await waitFor(() => expect(tab('Resource actions')).toBeInTheDocument());
      await user.click(tab('Resource actions'));
      expect(tab('Resource actions')).toHaveAttribute('aria-selected', 'true');

      await user.type(screen.getByRole('combobox'), 'plan');
      await waitFor(() =>
        expect(screen.getByText('Change plan')).toBeInTheDocument(),
      );
      expect(tab('All')).toHaveAttribute('aria-selected', 'true');

      await user.clear(screen.getByRole('combobox'));
      expect(tab('Resource actions')).toHaveAttribute('aria-selected', 'true');
      expect(screen.queryByText('Change plan')).not.toBeInTheDocument();
    });

    it('offers a tab for a group whose actions render only once loaded', async () => {
      // Provider actions wait for the offering before they render anything.
      const LateAction = () => {
        const [loaded, setLoaded] = useState(false);
        useEffect(() => {
          setTimeout(() => setLoaded(true), 0);
        }, []);
        return loaded ? (
          <ActionItem title="Report usage" action={vi.fn()} />
        ) : null;
      };
      render(
        <ModalHideContext.Provider value={onHide}>
          <ModalActionsDialog
            name="Production Web"
            refetch={vi.fn()}
            ActionsList={() => (
              <>
                <ActionGroup title="Resource actions">
                  <ActionItem title="Start" action={startAction} />
                </ActionGroup>
                <ActionGroup title="Provider actions">
                  <LateAction />
                </ActionGroup>
              </>
            )}
            resource={{ uuid: 'res-1' }}
            marketplaceResource={{ uuid: 'res-1', state: 'OK' }}
          />
        </ModalHideContext.Provider>,
      );
      expect(
        await screen.findByRole('tab', { name: 'Provider actions' }),
      ).toBeInTheDocument();
    });

    it('offers no tab for a group whose actions all rendered nothing', async () => {
      const Empty = () => null;
      render(
        <ModalHideContext.Provider value={onHide}>
          <ModalActionsDialog
            name="Production Web"
            refetch={vi.fn()}
            ActionsList={() => (
              <>
                <ActionGroup title="Resource actions">
                  <ActionItem title="Start" action={startAction} />
                </ActionGroup>
                <ActionGroup title="Staff actions">
                  <Empty />
                </ActionGroup>
              </>
            )}
            resource={{ uuid: 'res-1' }}
            marketplaceResource={{ uuid: 'res-1', state: 'OK' }}
          />
        </ModalHideContext.Provider>,
      );
      await screen.findByText('Start');
      // One group left is no choice to make, so there is no bar at all.
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });
  });
});
