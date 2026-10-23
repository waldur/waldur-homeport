import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TableNav } from './TableNav';

// The global router mock (test/mocks/router.js) gives every Link an href of
// `<state><JSON params>`, so the target a tab links to can be read from it.
describe('TableNav', () => {
  beforeEach(() => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'page' },
      params: {},
    } as any);
  });

  it('renders router tabs as links to their state and params', () => {
    render(
      <TableNav
        tabs={[
          {
            key: 'all',
            title: 'All',
            params: { state: undefined },
            default: true,
          },
          { key: 'draft', title: 'Draft', params: { state: 'draft' } },
          { key: 'other', title: 'Other', state: 'elsewhere' },
        ]}
      />,
    );

    // A tab without its own state stays on the current one.
    expect(screen.getByRole('link', { name: 'Draft' })).toHaveAttribute(
      'href',
      'page{"state":"draft"}',
    );
    expect(screen.getByRole('link', { name: 'Other' })).toHaveAttribute(
      'href',
      'elsewhere',
    );
  });

  it('keeps string titles off the text-anchor link style', () => {
    render(
      <TableNav
        tabs={[
          { key: 'a', title: 'Plain title', params: { state: undefined } },
        ]}
      />,
    );

    // `.text-anchor` (given by Link to string children) sets `border: none`
    // and an underline on hover, which wrecks the tab.
    expect(screen.getByRole('link', { name: 'Plain title' })).not.toHaveClass(
      'text-anchor',
    );
  });

  it('marks the tab matching the current params as the current page', () => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'page' },
      params: { state: 'draft' },
    } as any);

    render(
      <TableNav
        tabs={[
          {
            key: 'all',
            title: 'All',
            params: { state: undefined },
            default: true,
          },
          { key: 'draft', title: 'Draft', params: { state: 'draft' } },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Draft' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'All' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  describe('focus across a route switch', () => {
    const teamTabs = [
      { key: 'users', title: 'Active', state: 'team-users' },
      { key: 'invitations', title: 'Invitations', state: 'team-invitations' },
    ];

    // The router replaces the page, and the bar with it: a new key remounts.
    const switchTo = (rerender, stateName: string, tabs = teamTabs) => {
      vi.mocked(useCurrentStateAndParams).mockReturnValue({
        state: { name: stateName },
        params: {},
      } as any);
      rerender(
        <div key={stateName}>
          <TableNav tabs={tabs} />
        </div>,
      );
    };

    const renderOn = (stateName: string) => {
      vi.mocked(useCurrentStateAndParams).mockReturnValue({
        state: { name: stateName },
        params: {},
      } as any);
      return render(
        <div key={stateName}>
          <TableNav tabs={teamTabs} />
        </div>,
      );
    };

    const pressEnterOn = async (name: string) => {
      const link = screen.getByRole('link', { name });
      link.focus();
      await userEvent.keyboard('{Enter}');
      return link;
    };

    it('moves focus to the current tab of the bar that replaces it', async () => {
      const { rerender } = renderOn('team-users');
      const link = await pressEnterOn('Invitations');

      switchTo(rerender, 'team-invitations');

      const current = screen.getByRole('link', { name: 'Invitations' });
      expect(current).not.toBe(link);
      expect(current).toHaveAttribute('aria-current', 'page');
      expect(current).toHaveFocus();
    });

    it('leaves focus alone after a pointer click', async () => {
      const { rerender } = renderOn('team-users');
      await userEvent.click(screen.getByRole('link', { name: 'Invitations' }));

      switchTo(rerender, 'team-invitations');

      expect(document.body).toHaveFocus();
    });

    it('does not take focus for a different set of tabs', async () => {
      const { rerender } = renderOn('team-users');
      await pressEnterOn('Invitations');

      switchTo(rerender, 'elsewhere', [
        { key: 'a', title: 'A', state: 'elsewhere' },
        { key: 'b', title: 'B', state: 'other' },
      ]);

      expect(document.body).toHaveFocus();
    });

    it('does not steal focus the user has moved elsewhere', async () => {
      const { rerender } = renderOn('team-users');
      await pressEnterOn('Invitations');
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      switchTo(rerender, 'team-invitations');

      expect(input).toHaveFocus();
      input.remove();
    });
  });

  it('keeps a tab with onSelect as a button that calls it', async () => {
    const onSelect = vi.fn();
    render(
      <TableNav
        tabs={[
          { key: 'a', title: 'A', onSelect, active: true },
          { key: 'b', title: 'B', onSelect },
        ]}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'B' }));

    expect(onSelect).toHaveBeenCalledWith('b');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    // A local-state tab switches what is shown, so it is the current item
    // rather than the current page.
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});
