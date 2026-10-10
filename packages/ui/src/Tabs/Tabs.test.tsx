import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TabNav, Tabs, TabsContent, TabsList, TabsTrigger } from './index';

// TabNav fills a link item's content with its title, so the element given as
// \`link\` is written empty; a component keeps jsx-a11y from flagging that.
const Anchor = ({ children, ...props }: ComponentProps<'a'>) => (
  <a {...props}>{children}</a>
);

describe('Tabs', () => {
  it('renders tabs with line variant by default and switches on click', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel 1 Content</TabsContent>
        <TabsContent value="tab2">Panel 2 Content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByText('Panel 1 Content')).toBeVisible();
    expect(screen.queryByText('Panel 2 Content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.queryByText('Panel 1 Content')).not.toBeInTheDocument();
    expect(screen.getByText('Panel 2 Content')).toBeVisible();
  });

  it('selects on arrow keys by default (automatic activation)', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel 1</TabsContent>
        <TabsContent value="tab2">Panel 2</TabsContent>
      </Tabs>,
    );

    screen.getByRole('tab', { name: 'Tab 1' }).focus();
    await user.keyboard('{ArrowRight}');

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab2).toHaveFocus();
    expect(tab2).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Panel 2')).toBeVisible();
  });

  it('moves focus without selecting under activationMode="manual"', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1" activationMode="manual">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel 1</TabsContent>
        <TabsContent value="tab2">Panel 2</TabsContent>
      </Tabs>,
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

    tab1.focus();
    await user.keyboard('{ArrowRight}');
    expect(tab2).toHaveFocus();
    expect(tab1).toHaveAttribute('data-state', 'active');
    expect(screen.queryByText('Panel 2')).not.toBeInTheDocument();

    await user.keyboard('{Enter}');
    expect(tab2).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Panel 2')).toBeVisible();
  });

  it('handles mount="active" by unmounting inactive panels', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1" mount="active">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel 1</TabsContent>
        <TabsContent value="tab2">Panel 2</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText('Panel 1')).toBeInTheDocument();
    expect(screen.queryByText('Panel 2')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

    expect(screen.queryByText('Panel 1')).not.toBeInTheDocument();
    expect(screen.getByText('Panel 2')).toBeInTheDocument();
  });

  it('handles mount="visited" by preserving visited panels in DOM with hidden attribute', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1" mount="visited">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel 1</TabsContent>
        <TabsContent value="tab2">Panel 2</TabsContent>
        <TabsContent value="tab3">Panel 3</TabsContent>
      </Tabs>,
    );

    // Initial state: tab1 visited, tab2 and tab3 not visited
    expect(screen.getByText('Panel 1')).toBeVisible();
    expect(screen.queryByText('Panel 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Panel 3')).not.toBeInTheDocument();

    // Visit tab 2
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

    expect(screen.queryByText('Panel 1')).not.toBeVisible();
    expect(screen.getByText('Panel 1')).toBeInTheDocument(); // Still in DOM!
    expect(screen.getByText('Panel 2')).toBeVisible();
    expect(screen.queryByText('Panel 3')).not.toBeInTheDocument(); // Never visited
  });

  it('handles mount="all" by mounting all panels immediately', () => {
    render(
      <Tabs defaultValue="tab1" mount="all">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel 1</TabsContent>
        <TabsContent value="tab2">Panel 2</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText('Panel 1')).toBeVisible();
    expect(screen.getByText('Panel 2')).toBeInTheDocument();
    expect(screen.queryByText('Panel 2')).not.toBeVisible();
  });

  it('renders disabled tabs with tooltip wrapped in span for hover events', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled tooltip="Tab 2 is disabled">
            Tab 2
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel 1</TabsContent>
        <TabsContent value="tab2">Panel 2</TabsContent>
      </Tabs>,
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab2).toBeDisabled();
    // Wrapper span preserves tablist hierarchy with role="presentation" and allows keyboard access
    // eslint-disable-next-line testing-library/no-node-access
    const wrapper = tab2.parentElement;
    expect(wrapper).toHaveAttribute('role', 'presentation');
    expect(wrapper).toHaveAttribute('tabindex', '0');

    // Hover over the disabled tab (or its wrapper span)
    await user.hover(tab2);

    await waitFor(() => {
      expect(screen.getByText('Tab 2 is disabled')).toBeInTheDocument();
    });
  });

  it('opens tooltip when disabled tab wrapper is focused with keyboard', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled tooltip="Tab 2 is disabled">
            Tab 2
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel 1</TabsContent>
        <TabsContent value="tab2">Panel 2</TabsContent>
      </Tabs>,
    );

    await user.tab();
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();

    await user.tab();
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    // eslint-disable-next-line testing-library/no-node-access
    expect(tab2.parentElement).toHaveFocus();

    await waitFor(() => {
      expect(screen.getByText('Tab 2 is disabled')).toBeInTheDocument();
    });
  });
});

// The scroll frame has no role or label to query, so reach it from its list.
/* eslint-disable testing-library/no-node-access */
const frameOf = (list: HTMLElement | null | undefined) => list?.parentElement;
const frameOfTrigger = (trigger: HTMLElement) =>
  trigger.closest('ul')?.parentElement;
/* eslint-enable testing-library/no-node-access */

describe('scrollable lists', () => {
  it('frames a scrollable TabsList so the underline overhang is not clipped', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList scrollable scrollClassName="flex-grow-1" data-testid="list">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel</TabsContent>
      </Tabs>,
    );

    const frame = frameOf(screen.getByTestId('list'));
    expect(frame).toHaveClass(
      'overflow-x-auto',
      'overflow-y-hidden',
      'pb-px',
      'min-w-0',
      'flex-grow-1',
    );
  });

  it('adds no frame unless scrollable is set', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList data-testid="list">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(frameOf(screen.getByTestId('list'))).not.toHaveClass(
      'overflow-x-auto',
    );
  });

  it('frames a scrollable TabNav list', () => {
    render(
      <TabNav
        items={[{ key: 'b', title: 'B' }]}
        scrollable
        scrollClassName="flex-grow-1"
      />,
    );

    expect(
      frameOfTrigger(screen.getByRole('button', { name: 'B' })),
    ).toHaveClass('overflow-x-auto', 'pb-px', 'flex-grow-1');
  });
});

describe('TabsContent forceMount', () => {
  const renderTabs = () =>
    render(
      <Tabs defaultValue="one" mount="active">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two" forceMount>
          <input aria-label="draft" />
        </TabsContent>
      </Tabs>,
    );

  it('keeps a forceMounted panel mounted but hidden while it is inactive', () => {
    renderTabs();

    const draft = screen.getByLabelText('draft', { selector: 'input' });
    expect(draft).toBeInTheDocument();
    expect(draft).not.toBeVisible();
    expect(screen.getByText('First panel')).toBeVisible();
  });

  it('keeps the typed value when the user leaves and returns to the tab', async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole('tab', { name: 'Two' }));
    await user.type(screen.getByLabelText('draft'), 'unsaved');
    await user.click(screen.getByRole('tab', { name: 'One' }));
    await user.click(screen.getByRole('tab', { name: 'Two' }));

    expect(screen.getByLabelText('draft')).toHaveValue('unsaved');
  });

  it('does not show the other panels at the same time', async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole('tab', { name: 'Two' }));

    expect(screen.queryByText('First panel')).not.toBeInTheDocument();
    expect(screen.getByLabelText('draft')).toBeVisible();
  });
});

describe('TabNav', () => {
  it('marks the active button item aria-current="true" and handles onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <TabNav
        items={[
          { key: 'overview', title: 'Overview' },
          { key: 'details', title: 'Details' },
          {
            key: 'disabled',
            title: 'Disabled',
            disabled: true,
            tooltip: 'Not allowed',
          },
        ]}
        activeKey="overview"
        onSelect={onSelect}
      />,
    );

    // A button switches what is shown; only a link names the current page.
    const overviewBtn = screen.getByRole('button', { name: 'Overview' });
    expect(overviewBtn).toHaveAttribute('aria-current', 'true');

    const detailsBtn = screen.getByRole('button', { name: 'Details' });
    expect(detailsBtn).not.toHaveAttribute('aria-current');

    await user.click(detailsBtn);
    expect(onSelect).toHaveBeenCalledWith('details');

    const disabledBtn = screen.getByRole('button', { name: 'Disabled' });
    expect(disabledBtn).toBeDisabled();

    await user.hover(disabledBtn);
    await waitFor(() => {
      expect(screen.getByText('Not allowed')).toBeInTheDocument();
    });
  });

  it('renders an item with `link` as that link, titled by the item', () => {
    const onSelect = vi.fn();
    render(
      <TabNav
        activeKey="a"
        onSelect={onSelect}
        items={[
          {
            key: 'a',
            title: 'Alpha',
            link: <Anchor href="/a">ignored</Anchor>,
          },
          {
            key: 'b',
            title: 'Beta',
            link: <Anchor href="/b" />,
            testId: 'tab-b',
          },
        ]}
      />,
    );

    const alpha = screen.getByRole('link', { name: 'Alpha' });
    expect(alpha).toHaveAttribute('href', '/a');
    expect(alpha).toHaveAttribute('aria-current', 'page');
    expect(alpha).not.toHaveTextContent('ignored');
    expect(alpha).not.toHaveAttribute('type');
    const beta = screen.getByRole('link', { name: 'Beta' });
    expect(beta).not.toHaveAttribute('aria-current');
    expect(beta).toHaveAttribute('data-testid', 'tab-b');
    // A link navigates by itself; onSelect is for button tabs only.
    expect(beta).not.toHaveAttribute('role');
  });

  it('keeps a disabled link tab out of reach of the pointer and the tab order', () => {
    render(
      <TabNav
        activeKey="a"
        items={[
          { key: 'a', title: 'Alpha', link: <Anchor href="/a" /> },
          {
            key: 'b',
            title: 'Beta',
            link: <Anchor href="/b" />,
            disabled: true,
            tooltip: 'Not yet',
          },
        ]}
      />,
    );

    const beta = screen.getByRole('link', { name: 'Beta' });
    expect(beta).toHaveAttribute('aria-disabled', 'true');
    expect(beta).toHaveAttribute('tabindex', '-1');
    expect(beta.className).toContain('pointer-events-none');
  });

  it('renders its items as real list items', () => {
    render(
      <TabNav
        items={[
          { key: 'a', title: 'A' },
          { key: 'b', title: 'B' },
        ]}
      />,
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('gives the nav a default accessible name', () => {
    render(<TabNav items={[{ key: 'a', title: 'A' }]} />);

    expect(screen.getByRole('navigation')).toHaveAccessibleName('Tabs');
  });

  it("calls a button item's onClick, then onSelect", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];

    render(
      <TabNav
        activeKey="tab1"
        onSelect={(key) => calls.push(`select ${key}`)}
        items={[
          { key: 'tab1', title: 'Tab 1' },
          { key: 'tab2', title: 'Tab 2', onClick: () => calls.push('click') },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Tab 2' }));
    expect(calls).toEqual(['click', 'select tab2']);
  });
});

describe('active tab scrolling', () => {
  const box = (left: number, right: number) =>
    ({ left, right, top: 0, bottom: 0, width: right - left }) as DOMRect;

  it('scrolls the frame sideways to bring the active tab into view', () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute('aria-selected') === 'true') {
          return box(500, 600);
        }
        return box(0, 300);
      });

    render(
      <Tabs defaultValue="last">
        <TabsList scrollable>
          <TabsTrigger value="first">First</TabsTrigger>
          <TabsTrigger value="last">Last</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(frameOf(screen.getByRole('tablist'))?.scrollLeft).toBe(300);
    rect.mockRestore();
  });

  it('scrolls the active tab into view once container gains width after initial zero-width mount', () => {
    let containerWidth = 0;
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (containerWidth === 0) {
          return box(0, 0);
        }
        if (this.getAttribute('aria-selected') === 'true') {
          return box(500, 600);
        }
        return box(0, 300);
      });

    const { rerender } = render(
      <Tabs defaultValue="last">
        <TabsList scrollable>
          <TabsTrigger value="first">First</TabsTrigger>
          <TabsTrigger value="last">Last</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const frame = frameOf(screen.getByRole('tablist'));
    expect(frame?.scrollLeft).toBe(0);

    // Container becomes visible / gains dimensions, causing a re-render
    containerWidth = 300;
    rerender(
      <Tabs defaultValue="last">
        <TabsList scrollable>
          <TabsTrigger value="first">First</TabsTrigger>
          <TabsTrigger value="last">Last</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(frame?.scrollLeft).toBe(300);
    rect.mockRestore();
  });

  it('scrolls active tab into view when ResizeObserver triggers after initial zero-width mount', () => {
    let roCallback: () => void = () => {};
    let observedElement: Element | null = null;
    const originalRO = window.ResizeObserver;
    window.ResizeObserver = class {
      constructor(cb: any) {
        roCallback = cb;
      }
      observe(el: Element) {
        observedElement = el;
      }
      unobserve() {}
      disconnect() {}
    } as any;

    let isZero = true;
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (isZero) {
          return box(0, 0);
        }
        if (this.getAttribute('aria-selected') === 'true') {
          return box(500, 600);
        }
        return box(0, 300);
      });

    render(
      <Tabs defaultValue="last">
        <TabsList scrollable>
          <TabsTrigger value="first">First</TabsTrigger>
          <TabsTrigger value="last">Last</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const frame = frameOf(screen.getByRole('tablist'));
    expect(frame?.scrollLeft).toBe(0);
    expect(observedElement).toBe(frame);

    // Reveal container without a React re-render: ResizeObserver fires
    isZero = false;
    act(() => {
      roCallback();
    });

    expect(frame?.scrollLeft).toBe(300);

    rect.mockRestore();
    window.ResizeObserver = originalRO;
  });
});

describe('TabsTrigger extras', () => {
  it('shows a count badge, and a spinner while it loads', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" count={3}>
            A
          </TabsTrigger>
          <TabsTrigger value="b" countLoading>
            B
          </TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: /A/ })).toHaveTextContent('A3');
    expect(
      within(screen.getByRole('tab', { name: /B/ })).getByRole('status'),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'C' })).toHaveTextContent(/^C$/);
  });

  it('shows a count of zero', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" count={0}>
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(screen.getByRole('tab')).toHaveTextContent('A0');
  });

  it('shows a hint as the tooltip, with no nested control', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" hint="What A means">
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const tab = screen.getByRole('tab', { name: 'A' });
    expect(within(tab).queryByRole('button')).not.toBeInTheDocument();
    await user.hover(tab);
    await waitFor(() =>
      expect(screen.getAllByText('What A means').length).toBeGreaterThan(0),
    );
  });
});

describe('active style under a tooltip', () => {
  // A Tooltip's Radix trigger overwrites the tab's `data-state`, so the
  // selected style must key off `aria-selected` / `aria-current` instead.
  it('keeps a tab with a hint marked selected by aria-selected', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" hint="Help">
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const tab = screen.getByRole('tab', { name: 'A' });
    expect(tab).not.toHaveAttribute('data-state', 'active');
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveClass('aria-selected:border-b-[var(--tabs-indicator)]');
    expect(tab.className).not.toContain('data-[state=active]');
  });

  it('keeps a TabNav item with a tooltip marked current by aria-current', () => {
    render(
      <TabNav
        activeKey="a"
        items={[{ key: 'a', title: 'A', tooltip: 'Help' }]}
      />,
    );

    const item = screen.getByRole('button', { name: 'A' });
    expect(item).toHaveAttribute('aria-current', 'true');
    expect(item).toHaveClass(
      '[&[aria-current]]:border-b-[var(--tabs-indicator)]',
    );
  });
});

describe('TabsList variants', () => {
  it('draws segments with variant="segmented"', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList variant="segmented" fullWidth aria-label="Method">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(screen.getByRole('tablist')).toHaveClass('flex', 'w-full');
    const active = screen.getByRole('tab', { name: 'A' });
    expect(active).toHaveClass(
      'flex-1',
      'aria-selected:bg-[var(--btn-tertiary-bg-pressed)]',
    );
    expect(active).not.toHaveClass('border-b-2');
  });

  it('drops the strip line with bordered={false}', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList bordered={false}>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(screen.getByRole('tablist')).toHaveClass('border-b-0');
  });
});

describe('Tabs items (data form)', () => {
  const items = [
    { value: 'a', title: 'A', content: 'Panel A', count: 2 },
    { value: 'b', title: 'B', content: 'Panel B', hint: 'About B' },
    { value: 'c', title: 'C', content: 'Panel C', hidden: true },
    { value: 'd', title: 'D', content: 'Panel D', disabled: true },
  ];

  it('draws the strip and the open panel from data', () => {
    render(<Tabs items={items} defaultValue="a" />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tab', { name: /A/ })).toHaveTextContent('A2');
    expect(screen.getByText('Panel A')).toBeInTheDocument();
    expect(screen.queryByText('Panel B')).not.toBeInTheDocument();
  });

  it('opens the first tab when nothing is chosen', () => {
    render(<Tabs items={items} />);

    expect(screen.getByText('Panel A')).toBeInTheDocument();
  });

  it('falls back when the chosen tab is hidden or disabled', () => {
    const { rerender } = render(<Tabs items={items} value="c" />);
    expect(screen.getByText('Panel A')).toBeInTheDocument();

    rerender(<Tabs items={items} value="d" />);
    expect(screen.getByText('Panel A')).toBeInTheDocument();
  });

  it('falls back when the open tab goes away', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Tabs items={items} />);
    await user.click(screen.getByRole('tab', { name: 'B' }));
    expect(screen.getByText('Panel B')).toBeInTheDocument();

    rerender(
      <Tabs
        items={items.map((item) =>
          item.value === 'b' ? { ...item, hidden: true } : item,
        )}
      />,
    );
    expect(screen.getByText('Panel A')).toBeInTheDocument();
  });

  it('renders children above the strip and passes list props', () => {
    render(
      <Tabs items={items} listProps={{ bordered: false }} panelsClassName="x">
        <h3>Title</h3>
      </Tabs>,
    );

    const heading = screen.getByRole('heading', { name: 'Title' });
    const tablist = screen.getByRole('tablist');
    expect(
      heading.compareDocumentPosition(tablist) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(tablist).toHaveClass('border-b-0');
  });
});
