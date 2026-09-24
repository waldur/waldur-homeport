import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { IBreadcrumbItem } from '@/navigation/types';

import { DropdownBreadcrumbItem } from './DropdownBreadcrumbItem';
import { HiddenItemsPopover } from './HiddenItemsPopover';

// The active crumb has no inner link, so it used to hold nothing focusable and
// its switcher was mouse-only.
describe('DropdownBreadcrumbItem', () => {
  const activeItem: IBreadcrumbItem = {
    key: 'project',
    text: 'Project Alpha',
    active: true,
    dropdown: <div>Project switcher</div>,
  };

  it('exposes the active crumb as a button reachable with Tab', async () => {
    const user = userEvent.setup();
    render(<DropdownBreadcrumbItem item={activeItem} />);

    const trigger = screen.getByRole('button', { name: /Project Alpha/ });
    await user.tab();
    expect(trigger).toHaveFocus();
    // On the label, not the <li>: that would put the separator slash inside the
    // focus ring and cost the crumb its place in the list.
    expect(screen.getByRole('listitem')).toContainElement(trigger);
  });

  // Radix hands focus back to its trigger on close, so the trigger has to be
  // the focusable label -- on the <li> it was a no-op and focus fell to <body>.
  it('returns focus to the crumb when the switcher closes', async () => {
    const user = userEvent.setup();
    render(<DropdownBreadcrumbItem item={activeItem} />);

    const trigger = screen.getByRole('button', { name: /Project Alpha/ });
    await user.tab();
    await user.keyboard('{Enter}');
    await screen.findByText('Project switcher');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveFocus());
  });

  describe('leaving the panel with Tab', () => {
    // The handler skips elements without layout, and jsdom lays nothing out,
    // so give every node a parent to keep them in the running.
    const offsetParent = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetParent',
    );
    beforeAll(() => {
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        configurable: true,
        get() {
          return this.parentNode; // eslint-disable-line testing-library/no-node-access
        },
      });
    });
    afterAll(() => {
      Object.defineProperty(
        HTMLElement.prototype,
        'offsetParent',
        offsetParent,
      );
    });

    const renderOpen = async () => {
      const user = userEvent.setup();
      render(
        <DropdownBreadcrumbItem
          item={{
            ...activeItem,
            dropdown: (
              <>
                <button>first</button>
                <button>last</button>
              </>
            ),
          }}
        />,
      );
      const trigger = screen.getByRole('button', { name: /Project Alpha/ });
      await user.tab();
      await user.keyboard('{Enter}');
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'first' })).toHaveFocus(),
      );
      return { user, trigger };
    };

    it('closes after the last item and returns focus to the crumb', async () => {
      const { user, trigger } = await renderOpen();

      await user.tab();
      expect(screen.getByRole('button', { name: 'last' })).toHaveFocus();
      await user.tab();

      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'last' })).toBeNull(),
      );
      await waitFor(() => expect(trigger).toHaveFocus());
    });

    it('closes before the first item and returns focus to the crumb', async () => {
      const { user, trigger } = await renderOpen();

      await user.tab({ shift: true });

      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'first' })).toBeNull(),
      );
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  });

  // Radix hands focus to its trigger, which for this crumb is the <li>.
  it('returns focus to the collapsed crumb when its panel closes', async () => {
    const user = userEvent.setup();
    render(
      <DropdownBreadcrumbItem
        item={{ key: 'more', text: '...', dropdown: <div>Hidden crumbs</div> }}
      />,
    );

    await user.tab();
    const crumb = document.activeElement; // eslint-disable-line testing-library/no-node-access
    await user.keyboard('{Enter}');
    await screen.findByText('Hidden crumbs');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(crumb).toHaveFocus());
  });

  it('leaves focus where the user clicked when that closes the panel', async () => {
    const user = userEvent.setup();
    render(
      <>
        <input aria-label="elsewhere" />
        <DropdownBreadcrumbItem item={activeItem} />
      </>,
    );

    await user.click(screen.getByRole('button', { name: /Project Alpha/ }));
    await screen.findByText('Project switcher');
    await user.click(screen.getByRole('textbox', { name: 'elsewhere' }));

    await waitFor(() =>
      expect(screen.queryByText('Project switcher')).toBeNull(),
    );
    expect(screen.getByRole('textbox', { name: 'elsewhere' })).toHaveFocus();
  });

  // A modal panel blocked pointer events on the page, so the first click on,
  // say, a sidebar link only closed the panel.
  it('leaves the page behind it clickable while open', async () => {
    const user = userEvent.setup();
    const onOutsideClick = vi.fn();
    render(
      <>
        <button onClick={onOutsideClick}>outside</button>
        <DropdownBreadcrumbItem item={activeItem} />
      </>,
    );

    await user.click(screen.getByRole('button', { name: /Project Alpha/ }));
    await screen.findByText('Project switcher');
    await user.click(screen.getByRole('button', { name: 'outside' }));

    expect(onOutsideClick).toHaveBeenCalledTimes(1);
  });

  it.each(['{Enter}', ' '])('opens the switcher with %s', async (key) => {
    const user = userEvent.setup();
    render(<DropdownBreadcrumbItem item={activeItem} />);

    await user.tab();
    await user.keyboard(key);

    expect(await screen.findByText('Project switcher')).toBeInTheDocument();
  });

  // The collapsed "..." crumb renders an <a> with no href, which activates on
  // neither key by itself.
  it.each(['{Enter}', ' '])(
    'opens the collapsed crumbs with %s',
    async (key) => {
      const user = userEvent.setup();
      render(
        <DropdownBreadcrumbItem
          item={{
            key: 'more',
            text: '...',
            dropdown: <div>Hidden crumbs</div>,
          }}
        />,
      );

      await user.tab();
      await user.keyboard(key);

      expect(await screen.findByText('Hidden crumbs')).toBeInTheDocument();
    },
  );

  // A crumb with a link activates on Enter by itself, so handling the key here
  // as well would toggle the popover twice and leave it shut.
  it.each(['{Enter}', ' '])('opens a linked crumb with %s', async (key) => {
    const user = userEvent.setup();
    render(
      <DropdownBreadcrumbItem
        item={{
          key: 'project',
          text: 'Project Alpha',
          to: 'project.dashboard',
          dropdown: <div>Project switcher</div>,
        }}
      />,
    );

    await user.tab();
    await user.keyboard(key);

    expect(await screen.findByText('Project switcher')).toBeInTheDocument();
  });
});

describe('HiddenItemsPopover', () => {
  it('announces the collapsed crumbs as links', () => {
    render(
      <HiddenItemsPopover
        items={[
          { key: 'a', text: 'Organizations', to: 'organizations' },
          { key: 'b', text: 'Big Corp', to: 'organization.dashboard' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Organizations' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Big Corp' })).toBeVisible();
  });
});
