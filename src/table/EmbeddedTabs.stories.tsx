import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { EmbeddedTabs } from './EmbeddedTabs';

/**
 * Tabs whose panels are tables, as in an expandable row or a card section.
 * Only the open panel is mounted, so only its table fetches. The panels here
 * are plain placeholders; see docs/tabs.md.
 */
const meta: Meta<typeof EmbeddedTabs> = {
  title: 'Data Display/Table/EmbeddedTabs',
  component: EmbeddedTabs,
  decorators: [
    (Story) => (
      <div className="p-6 max-w-3xl">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof EmbeddedTabs>;

const Placeholder = ({ children }: { children: string }) => (
  <div className="p-4 text-sm text-[var(--surface-text-secondary)]">
    {children}
  </div>
);

const tabs = [
  {
    key: 'projects',
    title: 'Projects',
    count: 11,
    content: <Placeholder>Projects table</Placeholder>,
  },
  {
    key: 'resources',
    title: 'Resources',
    count: 88,
    content: <Placeholder>Resources table</Placeholder>,
  },
  {
    key: 'team',
    title: 'Team',
    count: 3,
    content: <Placeholder>Team table</Placeholder>,
  },
];

export const Default: Story = {
  args: { defaultValue: 'projects', tabs },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Projects table')).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: /Resources/ }));
    await expect(canvas.getByText('Resources table')).toBeVisible();
    await expect(canvas.queryByText('Projects table')).not.toBeInTheDocument();
  },
};

/** The strip framed like the card of the expandable row it sits in. */
export const Framed: Story = {
  args: { defaultValue: 'projects', framed: true, tabs },
};

/** A spinner replaces the count while it loads, and a tab without a count has no badge. */
export const LoadingAndMissingCounts: Story = {
  args: {
    defaultValue: 'projects',
    tabs: [
      { ...tabs[0], count: undefined, countLoading: true },
      { ...tabs[1], count: 0 },
      { ...tabs[2], count: undefined },
    ],
  },
};

/** `hidden` leaves a tab out, which replaces a `cond && <Tab>` branch. */
export const ConditionalTab: Story = {
  render: () => {
    const [canListUsers, setCanListUsers] = useState(false);
    return (
      <div>
        <button
          type="button"
          className="mb-3 text-sm underline"
          onClick={() => setCanListUsers((value) => !value)}
        >
          {canListUsers ? 'Revoke' : 'Grant'} permission to list users
        </button>
        <EmbeddedTabs
          defaultValue="projects"
          framed
          tabs={tabs.map((tab) => ({
            ...tab,
            hidden: tab.key === 'team' && !canListUsers,
          }))}
        />
      </div>
    );
  },
};

/** A title row above the strip; the strip then draws no frame of its own. */
export const WithHeader: Story = {
  args: {
    defaultValue: 'projects',
    header: (
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b">
        <span className="text-sm font-bold">Team</span>
        <span className="text-xs text-[var(--surface-text-secondary)]">
          header actions
        </span>
      </div>
    ),
    tabs,
  },
};

/** Controlled, e.g. when a toolbar elsewhere must follow the open tab. */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('resources');
    return (
      <div>
        <p className="mb-2 text-sm">
          Open tab: <strong>{value}</strong>
        </p>
        <EmbeddedTabs
          value={value}
          onValueChange={setValue}
          framed
          tabs={tabs}
        />
      </div>
    );
  },
};
