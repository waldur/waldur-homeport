import type { Meta, StoryObj } from '@storybook/react-vite';

import { BaseButton } from 'waldur-ui';

import { WidgetCard } from './WidgetCard';

/**
 * `WidgetCard` is the dashboard tile: a card title, then a bottom row with
 * the big `title` and its `meta` on the left and an optional `right` block
 * (a chart, a button). The bottom row wraps when the card gets narrow.
 */
const meta: Meta<typeof WidgetCard> = {
  title: 'Dashboard/WidgetCard',
  component: WidgetCard,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof WidgetCard>;

const Chart = () => (
  <div
    aria-hidden
    className="h-16 w-40 rounded-md bg-tertiary border-[1px] border-secondary"
  />
);

export const TitleAndMeta: Story = {
  args: {
    cardTitle: 'Resources',
    title: '128',
    meta: '+12 this month',
  },
};

export const WithRight: Story = {
  args: {
    cardTitle: 'Monthly cost',
    title: '€ 4 210.50',
    meta: 'Estimated',
    right: (
      <div className="flex-none self-center">
        <Chart />
      </div>
    ),
  },
};

export const RightOnly: Story = {
  args: {
    cardTitle: 'Team',
    right: (
      <div className="flex-none">
        <BaseButton variant="tertiary" label="Invite users" />
      </div>
    ),
  },
};

/** Three tiles in a dashboard row, as the organization dashboard shows them. */
export const InAGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <WidgetCard cardTitle="Projects" title="14" meta="2 new" />
      <WidgetCard
        cardTitle="Monthly cost"
        title="€ 4 210.50"
        meta="Estimated"
        right={
          <div className="flex-none self-center">
            <Chart />
          </div>
        }
      />
      <WidgetCard cardTitle="Team" title="37" meta="members" />
    </div>
  ),
};
