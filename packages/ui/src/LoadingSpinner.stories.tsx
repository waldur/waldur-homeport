import type { Meta, StoryObj } from '@storybook/react-vite';

import { BaseButton } from './BaseButton';
import { LoadingSpinner } from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Primitives/LoadingSpinner',
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
    <div className="flex gap-6 p-6 items-center">
      <LoadingSpinner size={16} />
      <LoadingSpinner size={24} />
      <LoadingSpinner size={32} />
      <LoadingSpinner size={48} />
    </div>
  ),
};

export const ColoredVariants: Story = {
  render: () => (
    <div className="flex gap-6 p-6 items-center">
      <LoadingSpinner size={24} className="text-[var(--waldur-brand-color)]" />
      <LoadingSpinner size={24} className="text-[var(--color-success-600)]" />
      <LoadingSpinner size={24} className="text-[var(--color-warning-600)]" />
      <LoadingSpinner size={24} className="text-[var(--color-error-600)]" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <div className="flex gap-4 p-6 items-center">
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
