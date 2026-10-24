import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { resetViewport, setViewport } from '../testing/viewport';

import { Menu, MenuDisclosure } from './Menu';

const renderDisclosure = () =>
  render(
    <>
      <MenuDisclosure>
        <MenuDisclosure.Trigger asChild>
          <button type="button">Account</button>
        </MenuDisclosure.Trigger>
        <MenuDisclosure.Content>
          <Menu.Item asChild>
            <a href="#profile">Profile</a>
          </Menu.Item>
          <MenuDisclosure.Section label="Credentials">
            <Menu.Item asChild>
              <a href="#keys">SSH keys</a>
            </Menu.Item>
          </MenuDisclosure.Section>
          <Menu.Item>Log out</Menu.Item>
        </MenuDisclosure.Content>
      </MenuDisclosure>
      <button type="button">Next on the page</button>
    </>,
  );

describe('MenuDisclosure', () => {
  it('is a button that expands a list, not a menu', async () => {
    const user = userEvent.setup();
    renderDisclosure();

    const trigger = screen.getByRole('button', { name: 'Account' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-haspopup');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('opens from the keyboard and keeps focus on its trigger', async () => {
    const user = userEvent.setup();
    renderDisclosure();

    await user.tab();
    const trigger = screen.getByRole('button', { name: 'Account' });
    expect(trigger).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('Tabs through every row, then on to the page, which closes it', async () => {
    const user = userEvent.setup();
    renderDisclosure();

    const trigger = screen.getByRole('button', { name: 'Account' });
    trigger.focus();
    await user.keyboard('{Enter}');

    await user.tab();
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Credentials' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Log out' })).toHaveFocus();

    await user.tab();
    expect(
      screen.getByRole('button', { name: 'Next on the page' }),
    ).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  // The footer menus end the page: past their last row lies only Radix's
  // focus guard, and focus used to drop from it onto the page body.
  it('returns focus to its trigger when Tab leaves the last thing on the page', async () => {
    const user = userEvent.setup();
    render(
      <MenuDisclosure>
        <MenuDisclosure.Trigger asChild>
          <button type="button">Legal</button>
        </MenuDisclosure.Trigger>
        <MenuDisclosure.Content>
          <Menu.Item>Terms</Menu.Item>
        </MenuDisclosure.Content>
      </MenuDisclosure>,
    );

    const trigger = screen.getByRole('button', { name: 'Legal' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Terms' })).toHaveFocus();
    await user.tab();

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('stays open when Shift+Tab goes back to its trigger', async () => {
    const user = userEvent.setup();
    renderDisclosure();

    const trigger = screen.getByRole('button', { name: 'Account' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.tab();
    await user.tab({ shift: true });

    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('returns focus to its trigger on Escape after Shift+Tab back to it', async () => {
    const user = userEvent.setup();
    renderDisclosure();

    const trigger = screen.getByRole('button', { name: 'Account' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.tab();
    await user.tab({ shift: true });
    await user.tab();
    await user.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape and returns focus to its trigger', async () => {
    const user = userEvent.setup();
    renderDisclosure();

    const trigger = screen.getByRole('button', { name: 'Account' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.tab();
    await user.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes when a row is chosen', async () => {
    const user = userEvent.setup();
    renderDisclosure();

    const trigger = screen.getByRole('button', { name: 'Account' });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  // The app's router Link prevents the click's default to navigate itself.
  it('closes when a router link row is chosen', async () => {
    const user = userEvent.setup();
    render(
      <MenuDisclosure>
        <MenuDisclosure.Trigger asChild>
          <button type="button">Account</button>
        </MenuDisclosure.Trigger>
        <MenuDisclosure.Content>
          <Menu.Item asChild>
            <a href="#profile" onClick={(event) => event.preventDefault()}>
              Profile
            </a>
          </Menu.Item>
        </MenuDisclosure.Content>
      </MenuDisclosure>,
    );

    const trigger = screen.getByRole('button', { name: 'Account' });
    await user.click(trigger);
    await user.click(screen.getByRole('link', { name: 'Profile' }));

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('stays open when a row keeps it open', async () => {
    const user = userEvent.setup();
    render(
      <MenuDisclosure>
        <MenuDisclosure.Trigger asChild>
          <button type="button">Account</button>
        </MenuDisclosure.Trigger>
        <MenuDisclosure.Content>
          <Menu.Item onSelect={(event) => event.preventDefault()}>
            Copy
          </Menu.Item>
        </MenuDisclosure.Content>
      </MenuDisclosure>,
    );

    const trigger = screen.getByRole('button', { name: 'Account' });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens a section flyout from the keyboard, without hover', async () => {
    const user = userEvent.setup();
    renderDisclosure();

    await user.click(screen.getByRole('button', { name: 'Account' }));
    const section = screen.getByRole('button', { name: 'Credentials' });
    expect(section).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: 'SSH keys' }),
    ).not.toBeInTheDocument();

    section.focus();
    await user.keyboard('{Enter}');

    expect(section).toHaveAttribute('aria-expanded', 'true');
    await user.tab();
    expect(screen.getByRole('link', { name: 'SSH keys' })).toHaveFocus();
  });

  it('Tabs out of a section flyout to the next row, which closes it', async () => {
    const user = userEvent.setup();
    renderDisclosure();

    await user.click(screen.getByRole('button', { name: 'Account' }));
    const section = screen.getByRole('button', { name: 'Credentials' });
    section.focus();
    await user.keyboard('{Enter}');
    await user.tab();
    await user.tab();

    expect(screen.getByRole('button', { name: 'Log out' })).toHaveFocus();
    expect(section).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes only the section flyout on Escape', async () => {
    const user = userEvent.setup();
    renderDisclosure();

    const trigger = screen.getByRole('button', { name: 'Account' });
    await user.click(trigger);
    const section = screen.getByRole('button', { name: 'Credentials' });
    section.focus();
    await user.keyboard('{Enter}');
    await user.tab();
    await user.keyboard('{Escape}');

    expect(section).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps a section flyout open when its row is clicked after hover', async () => {
    setViewport('desktop');
    const user = userEvent.setup();
    renderDisclosure();

    await user.click(screen.getByRole('button', { name: 'Account' }));
    const section = screen.getByRole('button', { name: 'Credentials' });
    await user.hover(section);
    expect(section).toHaveAttribute('aria-expanded', 'true');
    await user.click(section);

    expect(section).toHaveAttribute('aria-expanded', 'true');
    resetViewport();
  });

  describe('on a phone', () => {
    afterEach(() => resetViewport());

    it('drills into a section and back', async () => {
      setViewport('mobile');
      const user = userEvent.setup();
      renderDisclosure();

      await user.click(screen.getByRole('button', { name: 'Account' }));
      const section = screen.getByRole('button', { name: 'Credentials' });
      section.focus();
      await user.keyboard('{Enter}');

      // The section's rows replace the panel's, under a row that goes back.
      const back = screen.getByRole('button', { name: 'Credentials' });
      expect(back).toHaveFocus();
      expect(
        screen.queryByRole('link', { name: 'Profile' }),
      ).not.toBeInTheDocument();
      await user.tab();
      expect(screen.getByRole('link', { name: 'SSH keys' })).toHaveFocus();

      back.click();
      await screen.findByRole('link', { name: 'Profile' });
      expect(
        screen.queryByRole('link', { name: 'SSH keys' }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Credentials' })).toHaveFocus();
    });

    it('goes back up a level on Escape, keeping the panel open', async () => {
      setViewport('mobile');
      const user = userEvent.setup();
      renderDisclosure();

      const trigger = screen.getByRole('button', { name: 'Account' });
      await user.click(trigger);
      screen.getByRole('button', { name: 'Credentials' }).focus();
      await user.keyboard('{Enter}');
      await user.tab();
      expect(screen.getByRole('link', { name: 'SSH keys' })).toHaveFocus();

      await user.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await screen.findByRole('link', { name: 'Profile' });
      expect(screen.getByRole('button', { name: 'Credentials' })).toHaveFocus();

      await user.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });

    it('shows the panel again when widened while drilled in', async () => {
      setViewport('mobile');
      const user = userEvent.setup();
      renderDisclosure();

      await user.click(screen.getByRole('button', { name: 'Account' }));
      await user.click(screen.getByRole('button', { name: 'Credentials' }));
      act(() => setViewport('desktop'));

      expect(screen.getByRole('link', { name: 'Profile' })).toBeVisible();
    });
  });
});
