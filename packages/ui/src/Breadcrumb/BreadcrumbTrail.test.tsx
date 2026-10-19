import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { IBreadcrumbItem } from './BreadcrumbsContext';
import { BreadcrumbHiddenItems, BreadcrumbTrail } from './BreadcrumbTrail';

// A trail of one crumb with a dropdown: just the switcher crumb itself (only a
// plain lone crumb reads "Go back to").
const MenuCrumb = ({ item }: { item: IBreadcrumbItem }) => (
  <BreadcrumbTrail items={[item]} />
);

// The active crumb has no inner link, so it used to hold nothing focusable and
// its switcher was mouse-only.
describe('BreadcrumbTrail menu crumb', () => {
  const activeItem: IBreadcrumbItem = {
    key: 'project',
    text: 'Project Alpha',
    active: true,
    dropdown: <div>Project switcher</div>,
  };

  it('exposes the active crumb as a button reachable with Tab', async () => {
    const user = userEvent.setup();
    render(<MenuCrumb item={activeItem} />);

    const trigger = screen.getByRole('button', { name: /Project Alpha/ });
    await user.tab();
    expect(trigger).toHaveFocus();
    // On the label, not the <li>: that would put the separator slash inside the
    // focus ring and cost the crumb its place in the list.
    expect(screen.getByRole('listitem')).toContainElement(trigger);
  });

  // No BreadcrumbPage inside a switcher crumb carries aria-current, so the
  // item does.
  it('marks the active crumb as the current page', () => {
    render(<MenuCrumb item={activeItem} />);

    expect(screen.getByRole('listitem')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  // Radix hands focus back to its trigger on close, so the trigger has to be
  // the focusable label -- on the <li> it was a no-op and focus fell to <body>.
  it('returns focus to the crumb when the switcher closes', async () => {
    const user = userEvent.setup();
    render(<MenuCrumb item={activeItem} />);

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
        <MenuCrumb
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

  // Radix hands focus to its trigger, which for this crumb is the <li>, not
  // the <button> inside it.
  it('returns focus to the collapsed crumb when its panel closes', async () => {
    const user = userEvent.setup();
    render(
      <MenuCrumb
        item={{ key: 'more', text: '...', dropdown: <div>Hidden crumbs</div> }}
      />,
    );

    const crumb = screen.getByRole('button', { name: '...' });
    await user.tab();
    expect(crumb).toHaveFocus();
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
        <MenuCrumb item={activeItem} />
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
        <MenuCrumb item={activeItem} />
      </>,
    );

    await user.click(screen.getByRole('button', { name: /Project Alpha/ }));
    await screen.findByText('Project switcher');
    await user.click(screen.getByRole('button', { name: 'outside' }));

    expect(onOutsideClick).toHaveBeenCalledTimes(1);
  });

  it.each(['{Enter}', ' '])('opens the switcher with %s', async (key) => {
    const user = userEvent.setup();
    render(<MenuCrumb item={activeItem} />);

    await user.tab();
    await user.keyboard(key);

    expect(await screen.findByText('Project switcher')).toBeInTheDocument();
  });

  // The collapsed "..." crumb is a <button>, which activates on both keys by
  // itself, so handling them here as well would toggle the panel twice.
  it.each(['{Enter}', ' '])(
    'opens the collapsed crumbs with %s',
    async (key) => {
      const user = userEvent.setup();
      render(
        <MenuCrumb
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
      <MenuCrumb
        item={{
          key: 'project',
          text: 'Project Alpha',
          to: '/project',
          dropdown: <div>Project switcher</div>,
        }}
      />,
    );

    await user.tab();
    await user.keyboard(key);

    expect(await screen.findByText('Project switcher')).toBeInTheDocument();
  });
});

describe('BreadcrumbHiddenItems', () => {
  it('announces the collapsed crumbs as links', () => {
    render(
      <BreadcrumbHiddenItems
        items={[
          { key: 'a', text: 'Organizations', to: '/organizations' },
          { key: 'b', text: 'Big Corp', to: '/organizations/big-corp' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Organizations' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Big Corp' })).toBeVisible();
  });
});

describe('BreadcrumbTrail crumbs', () => {
  // BreadcrumbPage already says "current page"; repeating it on the <li> made
  // screen readers announce it twice.
  it('leaves aria-current to the BreadcrumbPage of a current crumb', () => {
    render(
      <BreadcrumbTrail
        items={[
          { key: 'a', text: 'Projects', to: '/projects' },
          { key: 'b', text: 'Project Alpha', active: true },
        ]}
      />,
    );

    const [, current] = screen.getAllByRole('listitem');
    expect(current).not.toHaveAttribute('aria-current');
    expect(
      screen.getByText('Project Alpha', {
        selector: '[aria-current="page"] *',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Project Alpha' }),
    ).not.toBeInTheDocument();
  });

  it('links a crumb through renderLink and runs its onClick', async () => {
    const onClick = vi.fn();
    const renderLink = vi.fn((to: string, params?: object) => (
      // Stands in for a router's link: the trail must not hand it an
      // onClick, which the app's Link turns into role="button". Empty: the
      // trail supplies its content.
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a href={`/${to}/${JSON.stringify(params)}`} />
    ));
    render(
      <BreadcrumbTrail
        renderLink={renderLink}
        items={[
          {
            key: 'a',
            text: 'Projects',
            to: 'projects',
            params: { page: 2 },
            onClick,
          },
          { key: 'b', text: 'Project Alpha', active: true },
        ]}
      />,
    );

    const link = screen.getByRole('link', { name: 'Projects' });
    expect(link).toHaveAttribute('href', '/projects/{"page":2}');
    expect(renderLink).toHaveBeenCalledWith('projects', { page: 2 });
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('uses `to` as a plain href without a renderLink', () => {
    render(
      <BreadcrumbTrail
        items={[
          { key: 'a', text: 'Projects', to: '/projects' },
          { key: 'b', text: 'Project Alpha', active: true },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
  });

  it('renders a crumb with only an onClick as a button', async () => {
    const onClick = vi.fn();
    render(
      <BreadcrumbTrail
        items={[
          { key: 'a', text: 'Offerings', onClick },
          { key: 'b', text: 'Offering', active: true },
        ]}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Offerings' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a crumb with no link or onClick as plain text', () => {
    render(
      <BreadcrumbTrail
        items={[
          { key: 'a', text: 'Organizations' },
          { key: 'b', text: 'Big Corp', active: true },
        ]}
      />,
    );

    expect(screen.getByText('Organizations')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('reads "Go back to" for a lone crumb', () => {
    render(
      <BreadcrumbTrail
        items={[{ key: 'a', text: 'Organizations', to: '/organizations' }]}
      />,
    );

    expect(screen.getByRole('link')).toHaveTextContent(
      'Go back to Organizations',
    );
  });

  it('does not read "Go back to" for a lone active crumb', () => {
    render(
      <BreadcrumbTrail
        items={[{ key: 'a', text: 'Dashboard', active: true }]}
      />,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText(/Go back to/)).not.toBeInTheDocument();
  });

  it('applies fallback truncation to a last non-active crumb', () => {
    render(
      <BreadcrumbTrail
        items={[
          { key: 'a', text: 'Organizations', to: '/organizations' },
          { key: 'b', text: 'Long Resource Name Without Active Flag' },
        ]}
      />,
    );

    const last = screen.getByText('Long Resource Name Without Active Flag');
    expect(last).toHaveClass('truncate');
  });
});

describe('BreadcrumbTrail collapse', () => {
  // jsdom lays nothing out: report a list wider than its box, and run the
  // ResizeObserver callback straight away.
  const scrollWidth = Object.getOwnPropertyDescriptor(
    Element.prototype,
    'scrollWidth',
  );
  beforeAll(() => {
    Object.defineProperty(Element.prototype, 'scrollWidth', {
      configurable: true,
      get: () => 1000,
    });
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
  });
  afterAll(() => {
    Object.defineProperty(Element.prototype, 'scrollWidth', scrollWidth!);
    vi.unstubAllGlobals();
  });

  it('folds the middle crumbs into "..." when the trail overflows', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumbTrail
        items={[
          { key: 'a', text: 'Organizations', to: '/organizations' },
          { key: 'b', text: 'Big Corp', to: '/organizations/big-corp' },
          { key: 'c', text: 'Projects', to: '/projects' },
          { key: 'd', text: 'Project Alpha', active: true },
        ]}
      />,
    );

    expect(
      screen.queryByRole('link', { name: 'Big Corp' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '...' }));
    expect(
      await screen.findByRole('link', { name: 'Big Corp' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
  });
});
