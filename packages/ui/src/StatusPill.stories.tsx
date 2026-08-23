import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusPill, StatusTone } from './StatusPill';

const TONES: StatusTone[] = ['success', 'warning', 'danger', 'neutral'];

const meta: Meta<typeof StatusPill> = {
  title: 'Dashboard/StatusPill',
  component: StatusPill,
  argTypes: {
    tone: { control: 'select', options: TONES },
  },
  args: {
    label: 'Active',
    tone: 'success',
  },
};
export default meta;

type Story = StoryObj<typeof StatusPill>;

export const Playground: Story = {};

/** The mockup's Project status column values. */
export const ProjectStatuses: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <StatusPill label="Active" tone="success" />
      <StatusPill label="Running" tone="neutral" />
      <StatusPill label="Quota risk" tone="warning" />
      <StatusPill label="Closed" tone="neutral" />
    </div>
  ),
};
