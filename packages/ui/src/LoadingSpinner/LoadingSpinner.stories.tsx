import type { Meta, StoryObj } from '@storybook/react-vite';

import { BaseButton } from '../Button';

import { LoadingSpinner } from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Feedback/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    docs: {
      description: {
        component:
          'Tailwind-native LoadingSpinner icon with animate-spin and role="status" for accessibility. Inherits current text color.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  render: () => (
    <div className="flex gap-5 p-5 items-center">
      <LoadingSpinner size={16} />
      <LoadingSpinner size={24} />
      <LoadingSpinner size={32} />
      <LoadingSpinner size={48} />
    </div>
  ),
};

export const ColoredVariants: Story = {
  render: () => (
    <div className="flex gap-5 p-5 items-center">
      <LoadingSpinner size={24} className="text-brand" />
      <LoadingSpinner size={24} className="text-success" />
      <LoadingSpinner size={24} className="text-warning" />
      <LoadingSpinner size={24} className="text-danger" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <div className="flex gap-3 p-5 items-center">
      <BaseButton
        variant="primary"
        label="Saving..."
        iconNode={<LoadingSpinner size={16} />}
        disabled
        tooltip="Action in progress"
      />
      <BaseButton
        variant="secondary"
        label="Refreshing"
        iconNode={<LoadingSpinner size={16} />}
      />
    </div>
  ),
};
