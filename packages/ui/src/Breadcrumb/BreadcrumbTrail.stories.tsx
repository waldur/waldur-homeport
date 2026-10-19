import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import {
  BreadcrumbLinkRenderer,
  BreadcrumbsProvider,
  IBreadcrumbItem,
  useBreadcrumbs,
} from './BreadcrumbsContext';
import { BreadcrumbTrail } from './BreadcrumbTrail';

// The trail fills a link element with the crumb's content, so the element
// renderLink returns is written empty; a component keeps jsx-a11y from
// flagging that.
const Anchor = ({ children, ...props }: ComponentProps<'a'>) => (
  <a {...props}>{children}</a>
);

const meta: Meta<typeof BreadcrumbTrail> = {
  title: 'Navigation/BreadcrumbTrail',
  component: BreadcrumbTrail,
  parameters: {
    docs: {
      description: {
        component:
          'The page breadcrumb trail. Single line: the current crumb middle-truncates, and when the leading crumbs do not fit either, everything between the first and last folds into a "..." popover. A crumb is a link (`to`, through the provider\'s `renderLink`, or a plain href without one), a button (`onClick`), plain text, or the current page (`active`); any of them can open a `dropdown`. Pages set crumbs with `useBreadcrumbs` inside a `BreadcrumbsProvider`, or pass `items` directly. See docs/breadcrumbs.md.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof BreadcrumbTrail>;

// A fixed width, so the stories that depend on overflow are deterministic.
const Frame = ({
  width = 720,
  children,
}: {
  width?: number;
  children: ReactNode;
}) => (
  <div className="flex p-4" style={{ width }}>
    {children}
  </div>
);

const TRAIL: IBreadcrumbItem[] = [
  { key: 'orgs', text: 'Organizations', to: '#organizations' },
  { key: 'org', text: 'Big Corp', to: '#organizations/big-corp' },
  { key: 'projects', text: 'Projects', to: '#projects' },
  { key: 'project', text: 'Project Alpha', active: true },
];

const SWITCHER_ITEMS = ['Project Alpha', 'Project Beta', 'Project Gamma'];

const Switcher = ({ close }: { close: () => void }) => (
  <ul className="m-0 list-none p-0">
    {SWITCHER_ITEMS.map((name) => (
      <li key={name}>
        <button
          type="button"
          className="block w-full border-0 bg-transparent px-5 py-2 text-start text-sm text-brand hover:bg-[var(--bg-brand-primary-alt)]"
          onClick={close}
        >
          {name}
        </button>
      </li>
    ))}
  </ul>
);

/** Links, then the current page, which is not a link. */
export const Default: Story = {
  render: () => (
    <Frame>
      <BreadcrumbTrail items={TRAIL} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation')).toHaveAccessibleName(
      'breadcrumb',
    );
    await expect(
      canvas.getByRole('link', { name: 'Big Corp' }),
    ).toHaveAttribute('href', '#organizations/big-corp');
    await expect(
      canvas.queryByRole('link', { name: 'Project Alpha' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByText('Project Alpha', {
        selector: '[aria-current="page"] *',
      }),
    ).toBeVisible();
  },
};

/** Each kind of crumb: link, button, plain text and the current page. */
export const CrumbKinds: Story = {
  render: () => {
    const onClick = fn();
    return (
      <Frame>
        <BreadcrumbTrail
          items={[
            { key: 'link', text: 'Link', to: '#link' },
            { key: 'button', text: 'Button', onClick },
            { key: 'text', text: 'Plain text' },
            { key: 'page', text: 'Current page', active: true },
          ]}
        />
      </Frame>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Link' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Button' })).toBeVisible();
    await expect(canvas.getByText('Plain text')).toBeVisible();
    // Plain text is neither a link nor a button.
    await expect(canvas.getAllByRole('link')).toHaveLength(1);
    await expect(canvas.getAllByRole('button')).toHaveLength(1);
  },
};

/**
 * Long leading crumbs keep their width and a long current crumb shrinks: its
 * middle collapses and its end stays readable.
 */
export const LongCurrentCrumb: Story = {
  render: () => (
    <Frame width={460}>
      <BreadcrumbTrail
        items={[
          { key: 'org', text: 'Big Corp', to: '#org' },
          { key: 'projects', text: 'Projects', to: '#projects' },
          {
            key: 'resource',
            text: 'Quantum Error Correction Simulations cluster (Create)',
            active: true,
          },
        ]}
      />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Still the whole trail: only the current crumb gave way.
    await expect(
      canvas.queryByRole('button', { name: '...' }),
    ).not.toBeInTheDocument();
    const head = canvas.getByTestId('middle-truncate-head');
    await expect(head.scrollWidth).toBeGreaterThan(head.clientWidth);
    await expect(canvas.getByTestId('middle-truncate-tail')).toBeVisible();
  },
};

const DEEP_TRAIL: IBreadcrumbItem[] = [
  { key: 'orgs', text: 'Organizations', to: '#organizations' },
  {
    key: 'org',
    text: 'Northern Research Computing Consortium',
    to: '#organizations/nrcc',
  },
  { key: 'projects', text: 'Projects', to: '#projects' },
  {
    key: 'project',
    text: 'Climate modelling 2026',
    to: '#projects/climate',
  },
  { key: 'resource', text: 'hpc-climate-runner-07', active: true },
];

/**
 * The leading crumbs don't fit: the middle folds into "...", whose popover
 * lists them. Escape closes it and puts focus back on "...".
 */
export const Collapsed: Story = {
  render: () => (
    <Frame width={380}>
      <BreadcrumbTrail items={DEEP_TRAIL} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const more = await canvas.findByRole('button', { name: '...' });
    await expect(
      canvas.getByRole('link', { name: 'Organizations' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('link', { name: 'Projects' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByText('hpc-climate-runner-07')).toBeVisible();

    await userEvent.click(more);
    // The popover is portaled to <body>.
    await expect(
      await screen.findByRole('link', { name: 'Projects' }),
    ).toBeVisible();
    await expect(
      screen.getByRole('link', { name: 'Climate modelling 2026' }),
    ).toHaveAttribute('href', '#projects/climate');

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        screen.queryByRole('link', { name: 'Projects' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(more).toHaveFocus());
  },
};

/** The same trail with room for it: shown in full. */
export const Expanded: Story = {
  render: () => (
    <Frame width={1000}>
      <BreadcrumbTrail items={DEEP_TRAIL} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole('button', { name: '...' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Projects' })).toBeVisible();
  },
};

/** A lone crumb is a way back. */
export const LoneCrumb: Story = {
  render: () => (
    <Frame>
      <BreadcrumbTrail
        items={[{ key: 'orgs', text: 'Organizations', to: '#organizations' }]}
      />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link')).toHaveTextContent(
      'Go back to Organizations',
    );
  },
};

/** `maxLength` always shortens the label, with the full text in a tooltip. */
export const MaxLength: Story = {
  render: () => (
    <Frame>
      <BreadcrumbTrail
        items={[
          {
            key: 'org',
            text: 'Northern Research Computing Consortium',
            to: '#org',
            maxLength: 16,
          },
          { key: 'issue', text: 'WAL-1234: Quota request', active: true },
        ]}
      />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link')).toHaveTextContent(
      /^Norther\.\.\.ortium$/,
    );
  },
};

/**
 * The current crumb opens a switcher. Its label is the trigger: Tab reaches
 * it, Enter and Space open the panel, Escape closes it and focus returns.
 */
export const SwitcherOnCurrentCrumb: Story = {
  render: () => (
    <Frame>
      <BreadcrumbTrail
        items={[
          ...TRAIL.slice(0, -1),
          {
            key: 'project',
            text: 'Project Alpha',
            active: true,
            dropdown: (close) => <Switcher close={close} />,
          },
        ]}
      />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Project Alpha/ });
    await expect(canvas.getAllByRole('listitem').at(-1)).toHaveAttribute(
      'aria-current',
      'page',
    );

    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect(
      await screen.findByRole('button', { name: 'Project Beta' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.keyboard(' ');
    await expect(
      await screen.findByRole('button', { name: 'Project Gamma' }),
    ).toBeVisible();
    // The dropdown function's `close` shuts the panel.
    await userEvent.click(
      screen.getByRole('button', { name: 'Project Gamma' }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Project Gamma' }),
      ).not.toBeInTheDocument(),
    );
  },
};

/**
 * A linked crumb with a switcher: Enter follows the link, Space opens the
 * panel. Tab past its last item closes it and puts focus back on the link.
 */
export const SwitcherOnLinkCrumb: Story = {
  render: () => (
    <Frame>
      <BreadcrumbTrail
        items={[
          TRAIL[0],
          {
            key: 'org',
            text: 'Big Corp',
            to: '#organizations/big-corp',
            dropdown: (close) => <Switcher close={close} />,
          },
          TRAIL[3],
        ]}
      />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Big Corp' });
    link.focus();
    await userEvent.keyboard(' ');
    await expect(
      await screen.findByRole('button', { name: 'Project Alpha' }),
    ).toBeVisible();

    for (let i = 0; i < SWITCHER_ITEMS.length; i++) {
      await userEvent.tab();
    }
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Project Alpha' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(link).toHaveFocus());
  },
};

const routerLink: BreadcrumbLinkRenderer = (to, params) => (
  <Anchor
    href={`#/${to}${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`}
    data-router-link=""
  />
);

/**
 * With a router: `renderLink` turns a crumb's `to` and `params` into the
 * app's link element (here a stand-in), which the trail fills with the label.
 */
export const WithRenderLink: Story = {
  render: () => (
    <Frame>
      <BreadcrumbTrail
        renderLink={routerLink}
        items={[
          {
            key: 'org',
            text: 'Big Corp',
            to: 'organization.dashboard',
            params: { uuid: 'big-corp' },
          },
          { key: 'project', text: 'Project Alpha', active: true },
        ]}
      />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Big Corp' });
    await expect(link).toHaveAttribute(
      'href',
      '#/organization.dashboard?uuid=big-corp',
    );
    await expect(link).toHaveAttribute('data-router-link');
  },
};

const PAGES: Record<string, IBreadcrumbItem[]> = {
  project: [
    { key: 'projects', text: 'Projects', to: 'projects' },
    { key: 'project', text: 'Project Alpha', active: true },
  ],
  resource: [
    { key: 'projects', text: 'Projects', to: 'projects' },
    { key: 'project', text: 'Project Alpha', to: 'project' },
    { key: 'resource', text: 'vm-alpha-01', active: true },
  ],
};

const Page = ({ name }: { name: string }) => {
  // Memoised: a new array each render would re-set the trail.
  const items = useMemo(() => PAGES[name], [name]);
  useBreadcrumbs(items);
  return <p className="m-0 text-sm text-tertiary">Page: {name}</p>;
};

/**
 * The app setup: the header's trail reads the crumbs the current page sets
 * with `useBreadcrumbs`, and links them through the provider's `renderLink`.
 */
export const WithProvider: Story = {
  render: () => {
    const [page, setPage] = useState('project');
    return (
      <BreadcrumbsProvider renderLink={routerLink}>
        <div className="flex flex-col gap-3 p-4" style={{ width: 720 }}>
          <div className="flex">
            <BreadcrumbTrail />
          </div>
          <div className="flex gap-2">
            {Object.keys(PAGES).map((name) => (
              <button
                key={name}
                type="button"
                className="text-sm"
                onClick={() => setPage(name)}
              >
                Open {name}
              </button>
            ))}
          </div>
          <Page name={page} />
        </div>
      </BreadcrumbsProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', { name: 'Projects' }),
    ).toHaveAttribute('href', '#/projects');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open resource' }),
    );
    await expect(
      await canvas.findByText('vm-alpha-01', {
        selector: '[aria-current="page"] *',
      }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'Project Alpha' }),
    ).toHaveAttribute('href', '#/project');
  },
};
