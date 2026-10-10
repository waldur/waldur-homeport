import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useEffect, useRef, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { TabNav, Tabs, TabsContent, TabsList, TabsTrigger } from './index';

// TabNav fills a link item's content with its title, so the element given as
// \`link\` is written empty; a component keeps jsx-a11y from flagging that.
const Anchor = ({ children, ...props }: ComponentProps<'a'>) => (
  <a {...props}>{children}</a>
);

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          'Tabs primitive backed by Radix UI, with the underline look. `mount` decides whether inactive panels stay in the DOM (active, visited, all); `activationMode` defaults to automatic (arrow keys also select); pass "manual" to make Enter/Space select. Triggers take a tooltip, which also works when they are disabled. For bars whose panel is drawn by the router, use TabNav. See docs/tabs.md.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const Panel = ({ children }: { children: string }) => (
  <div className="p-4 text-sm">{children}</div>
);

export const LineTabs: Story = {
  render: () => (
    <div className="p-6 max-w-xl">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Panel>Overview panel content</Panel>
        </TabsContent>
        <TabsContent value="resources">
          <Panel>Resources panel content</Panel>
        </TabsContent>
        <TabsContent value="activity">
          <Panel>Activity panel content</Panel>
        </TabsContent>
        <TabsContent value="settings">
          <Panel>Settings panel content</Panel>
        </TabsContent>
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Overview panel content')).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: 'Activity' }));
    await expect(canvas.getByText('Activity panel content')).toBeVisible();
    await expect(
      canvas.queryByText('Overview panel content'),
    ).not.toBeInTheDocument();
  },
};

/** Controlled: the page owns the value and can switch tabs itself. */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('members');
    return (
      <div className="p-6 max-w-xl">
        <Tabs value={value} onValueChange={setValue}>
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <Panel>Members list</Panel>
          </TabsContent>
          <TabsContent value="invitations">
            <Panel>Pending invitations</Panel>
          </TabsContent>
        </Tabs>
        <button
          type="button"
          className="mt-2 text-sm underline"
          onClick={() => setValue('invitations')}
        >
          Jump to invitations
        </button>
      </div>
    );
  },
};

export const WithDisabledAndTooltips: Story = {
  render: () => (
    <div className="p-6 max-w-xl">
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Available</TabsTrigger>
          <TabsTrigger
            value="tab2"
            disabled
            tooltip="You need administrator privileges to access billing"
          >
            Billing
          </TabsTrigger>
          <TabsTrigger
            value="tab3"
            disabled
            tooltip="Feature is currently in private preview"
          >
            Preview Features
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <Panel>Available tab contents</Panel>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

/**
 * `hint` puts help text in the tab's tooltip with a question-mark cue; `count`
 * adds a badge (`countLoading` shows a spinner in it). The selected tab keeps
 * its underline even though the tooltip wraps it.
 */
export const HintsAndCounts: Story = {
  render: () => (
    <div className="p-6 max-w-xl">
      <Tabs defaultValue="subnets">
        <TabsList>
          <TabsTrigger
            value="subnets"
            hint="Networks this organization trusts"
            count={4}
          >
            Access subnets
          </TabsTrigger>
          <TabsTrigger
            value="restrictions"
            hint="Who may become a member"
            countLoading
          >
            Membership restrictions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="subnets">
          <Panel>Subnets</Panel>
        </TabsContent>
        <TabsContent value="restrictions">
          <Panel>Restrictions</Panel>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

/**
 * `automatic` (the default) selects as focus moves, which is what the old
 * Bootstrap tabs did; `manual` moves focus with the arrow keys and selects on
 * Enter or Space.
 */
export const ActivationModes: Story = {
  render: () => (
    <div className="p-6 max-w-xl space-y-6">
      {(['automatic', 'manual'] as const).map((mode) => (
        <div key={mode}>
          <p className="text-xs text-[var(--surface-text-secondary)] mb-1">
            activationMode=&quot;{mode}&quot;
          </p>
          <Tabs defaultValue="one" activationMode={mode}>
            <TabsList>
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
              <TabsTrigger value="three">Three</TabsTrigger>
            </TabsList>
            <TabsContent value="one">
              <Panel>First ({mode})</Panel>
            </TabsContent>
            <TabsContent value="two">
              <Panel>Second ({mode})</Panel>
            </TabsContent>
            <TabsContent value="three">
              <Panel>Third ({mode})</Panel>
            </TabsContent>
          </Tabs>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [manualOne, automaticOne] = canvas.getAllByRole('tab', {
      name: 'One',
    });
    await userEvent.click(manualOne);
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByText('First (manual)')).toBeVisible();
    await userEvent.click(automaticOne);
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByText('Second (automatic)')).toBeVisible();
  },
};

/** Counts how often it mounts, so the three mount modes can be compared. */
const MountCounter = ({ label }: { label: string }) => {
  const mounts = useRef(0);
  const [, rerender] = useState(0);
  useEffect(() => {
    mounts.current += 1;
    rerender((value) => value + 1);
  }, []);
  return (
    <div className="p-3 text-sm">
      {label}: mounted {mounts.current}x
    </div>
  );
};

/**
 * `active` unmounts a panel when you leave it, `visited` keeps the ones you
 * have opened, `all` mounts every panel up front. Switch back and forth and
 * watch the counters.
 */
export const MountModes: Story = {
  render: () => (
    <div className="p-6 max-w-xl space-y-6">
      {(['active', 'visited', 'all'] as const).map((mode) => (
        <div key={mode}>
          <p className="text-xs text-[var(--surface-text-secondary)] mb-1">
            mount=&quot;{mode}&quot;
          </p>
          <Tabs defaultValue="a" mount={mode}>
            <TabsList>
              <TabsTrigger value="a">A</TabsTrigger>
              <TabsTrigger value="b">B</TabsTrigger>
            </TabsList>
            <TabsContent value="a">
              <MountCounter label={`${mode} / A`} />
            </TabsContent>
            <TabsContent value="b">
              <MountCounter label={`${mode} / B`} />
            </TabsContent>
          </Tabs>
        </div>
      ))}
    </div>
  ),
};

export const MountVisitedForm: Story = {
  render: () => (
    <div className="p-6 max-w-xl">
      <p className="text-xs text-[var(--surface-text-secondary)] mb-2">
        Typing into an input in Tab 1 and navigating to Tab 2 preserves input
        state because mount=&quot;visited&quot; keeps visited tabs mounted in
        DOM.
      </p>
      <Tabs defaultValue="general" mount="visited">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="p-4">
          <label
            htmlFor="story-project-name"
            className="block text-sm font-medium mb-1"
          >
            Project Name
          </label>
          <input
            id="story-project-name"
            type="text"
            placeholder="Enter name..."
            className="border px-3 py-1.5 rounded-md text-sm w-full"
          />
        </TabsContent>
        <TabsContent value="advanced" className="p-4">
          <label
            htmlFor="story-api-key"
            className="block text-sm font-medium mb-1"
          >
            API Key
          </label>
          <input
            id="story-api-key"
            type="text"
            placeholder="Enter key..."
            className="border px-3 py-1.5 rounded-md text-sm w-full"
          />
        </TabsContent>
      </Tabs>
    </div>
  ),
};

/**
 * In an `active` group, `forceMount` keeps one panel alive (here, a form
 * with unsaved input) while the others unmount. Radix itself would show a
 * forceMounted panel even when its tab is not selected, so TabsContent
 * hides it; only the selected panel is ever visible.
 */
export const ForceMountOnePanel: Story = {
  render: () => (
    <div className="p-6 max-w-xl">
      <Tabs defaultValue="summary" mount="active">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <Panel>Summary (unmounted whenever you leave it)</Panel>
        </TabsContent>
        <TabsContent value="draft" forceMount className="p-4">
          <label
            htmlFor="story-draft"
            className="block text-sm font-medium mb-1"
          >
            Draft text
          </label>
          <input
            id="story-draft"
            type="text"
            className="border px-3 py-1.5 rounded-md text-sm w-full"
          />
        </TabsContent>
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const draft = canvas.getByLabelText('Draft text', { selector: 'input' });
    await expect(draft).not.toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: 'Draft' }));
    await userEvent.type(draft, 'unsaved');
    await userEvent.click(canvas.getByRole('tab', { name: 'Summary' }));
    await expect(draft).not.toBeVisible();
    await expect(canvas.getByText(/Summary \(unmounted/)).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: 'Draft' }));
    await expect(draft).toHaveValue('unsaved');
  },
};

const MANY_TABS = [
  'Overview',
  'Resources',
  'Activity',
  'Billing',
  'Permissions',
  'Integrations',
  'Audit log',
  'Notifications',
];

/**
 * `scrollable` wraps the list in a frame that scrolls sideways and keeps the
 * active underline whole (it overhangs the strip by 1px, which any overflow
 * container would otherwise clip). The keyboard focus ring is inset for the
 * same reason. Tab into the strip to see it.
 */
export const ScrollableStrip: Story = {
  render: () => (
    <div className="p-6 w-[360px]">
      <Tabs defaultValue="Overview">
        <TabsList scrollable className="flex-nowrap">
          {MANY_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {MANY_TABS.map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Panel>{`${tab} panel content`}</Panel>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  ),
};

/** Router-driven bar with no panels here: a nav with aria-current. */
export const RouterTabNav: Story = {
  render: () => {
    const [currentTab, setCurrentTab] = useState('dashboard');

    return (
      <div className="p-6 max-w-xl">
        <TabNav
          items={[
            { key: 'dashboard', title: 'Dashboard' },
            { key: 'users', title: 'Users' },
            { key: 'quotas', title: 'Quotas' },
            {
              key: 'audit',
              title: 'Audit Logs',
              disabled: true,
              tooltip: 'Audit logs require compliance add-on',
            },
          ]}
          activeKey={currentTab}
          onSelect={setCurrentTab}
        />
        <div className="p-4 text-sm text-[var(--surface-text-secondary)]">
          Router currently simulating active route:{' '}
          <strong>{String(currentTab)}</strong>
        </div>
      </div>
    );
  },
};

/**
 * An item with `link` renders as that link, so middle-click, "open in new
 * tab" and the URL preview keep working. In the app it is a router
 * `<Link state="…" />`; here it is a plain anchor.
 */
export const LinkTabs: Story = {
  render: () => (
    <div className="p-6 max-w-xl">
      <TabNav
        aria-label="Reporting sections"
        activeKey="Overview"
        items={['Overview', 'Resources', 'Financial', 'Users'].map((tab) => ({
          key: tab,
          title: tab,
          link: <Anchor href={`#${tab.toLowerCase()}`} />,
        }))}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const current = canvas.getByRole('link', { name: 'Overview' });
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('link', { name: 'Users' })).toHaveAttribute(
      'href',
      '#users',
    );
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const ScrollableTabNav: Story = {
  render: () => (
    <div className="p-6 w-[360px]">
      <TabNav
        items={MANY_TABS.map((tab) => ({ key: tab, title: tab }))}
        activeKey="Overview"
        scrollable
        listClassName="flex-nowrap"
      />
    </div>
  ),
};
