import type { Meta, StoryObj } from '@storybook/react-vite';

import { Progress, type ProgressSize, type ProgressVariant } from './Progress';

const VARIANTS: ProgressVariant[] = [
  'primary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
  'purple',
  'blue',
  'indigo',
  'moss',
  'pink',
  'teal',
  'orange',
  'rose',
];
const SIZES: ProgressSize[] = ['xs', 'sm', 'md', 'lg'];

const meta: Meta<typeof Progress> = {
  title: 'Data Display/Progress',
  component: Progress,
  parameters: {
    docs: {
      description: {
        component:
          'A meter for a known value, stacked segments or an unknown amount. The track is always neutral and `variant` colours the fill (same colours as `Badge` solid). Replaces the Bootstrap `.progress` / `ProgressBar`. Heights are fixed by `size`: `xs` 4px, `sm` 6px, `md` 8px (default), `lg` 24px.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: () => (
    <div className="p-6 max-w-md">
      <Progress value={40} label="Usage" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="p-6 max-w-md flex flex-col gap-4">
      {SIZES.map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-8 text-sm">{size}</span>
          <Progress size={size} value={60} label={size} />
        </div>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="p-6 max-w-md flex flex-col gap-3">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <span className="w-16 text-sm">{variant}</span>
          <Progress variant={variant} value={65} label={variant} />
        </div>
      ))}
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="p-6 max-w-md">
      <Progress value={0} variant="danger" label="Empty" />
    </div>
  ),
};

export const Stacked: Story = {
  render: () => (
    <div className="p-6 max-w-md flex flex-col gap-4">
      <Progress
        size="lg"
        label="Policy thresholds"
        segments={[
          { value: 50, variant: 'success', label: 'Normal' },
          { value: 30, variant: 'warning', label: 'Notification' },
          { value: 20, variant: 'danger', label: 'Grace' },
        ]}
      />
      <Progress
        label="Resources by state"
        segments={[
          { value: 8, variant: 'primary' },
          { value: 3, variant: 'warning' },
        ]}
        max={20}
      />
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div className="p-6 max-w-md">
      <Progress indeterminate label="Uploading" />
    </div>
  ),
};
