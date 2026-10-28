import type { Meta, StoryObj } from '@storybook/react-vite';

import { SummaryWidget } from './SummaryWidget';

/**
 * `SummaryWidget` lays out a row of stat tiles. Up to five tiles share one
 * row from `sm` up (full width below), five share one row while they fit and
 * wrap when they don't, and six or more wrap six to a row.
 */
const meta: Meta<typeof SummaryWidget> = {
  title: 'Core/SummaryWidget',
  component: SummaryWidget,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof SummaryWidget>;

const STATS = [
  { label: 'Projects', value: 14 },
  { label: 'Resources', value: 128, footer: '+12 this month' },
  { label: 'Members', value: 37 },
  { label: 'Open issues', value: 5 },
  { label: 'Pending orders', value: 2 },
  { label: 'Invoices', value: 9 },
  { label: 'Credits', value: '€ 12 000' },
];

export const Two: Story = { args: { stats: STATS.slice(0, 2) } };
export const Three: Story = { args: { stats: STATS.slice(0, 3) } };
export const Four: Story = { args: { stats: STATS.slice(0, 4) } };
export const Five: Story = { args: { stats: STATS.slice(0, 5) } };
export const Seven: Story = { args: { stats: STATS } };
