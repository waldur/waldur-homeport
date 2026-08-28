import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Dashboard/StatCard',
  component: StatCard,
  parameters: {
    docs: {
      description: {
        component:
          'Ports src/core/StatsCard.tsx, the real KPI-tile component — see StatCard.tsx.',
      },
    },
  },
  args: {
    label: 'Projects',
    value: 12,
  },
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Playground: Story = {};

export const WithTrend: Story = {
  args: {
    trend: { label: '+2', tone: 'success' },
    hint: 'this quarter',
  },
};

export const WithHintOnly: Story = {
  args: {
    label: 'Invoice due',
    value: '€4,284',
    hint: 'pays May 30',
  },
};

/** Roughly the mockup's 4-tile row. */
export const Row: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        label="Projects"
        value={12}
        trend={{ label: '+2', tone: 'success' }}
        hint="this quarter"
      />
      <StatCard label="Members" value={48} hint="across projects" />
      <StatCard label="Invoice due" value="€4,284" hint="pays May 30" />
      <StatCard label="Quota health" value="Good" hint="all under 80%" />
    </div>
  ),
};
