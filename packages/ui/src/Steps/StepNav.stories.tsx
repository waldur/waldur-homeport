import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { StepNav, StepNavStep } from './StepNav';

const STEPS: StepNavStep[] = [
  { id: 'step-general', label: 'General information', status: 'complete' },
  {
    id: 'step-plan',
    label: 'Plan',
    status: 'error',
    message: 'Select a plan.',
  },
  {
    id: 'step-options',
    label: 'Additional configuration',
    status: 'warning',
    message: 'Ensure this value is at most 100.',
  },
  { id: 'step-final', label: 'Final configuration', status: 'required' },
  { id: 'step-review', label: 'Review' },
];

const meta: Meta<typeof StepNav> = {
  title: 'Wizard/StepNav',
  component: StepNav,
  parameters: {
    docs: {
      description: {
        component:
          'The side nav of a long, single-page form: one entry per step with its status, highlighting the step in view. Pass `renderItem` to draw the entries as router links, or build the items with `getStepNavItems` for an app-level `ScrollSpyNav`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-75 p-5 bg-primary">
        <Story />
      </div>
    ),
  ],
  args: { steps: STEPS },
};

export default meta;

type Story = StoryObj<typeof StepNav>;

export const Statuses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Plan')).toHaveAttribute('data-error');
    await expect(canvas.getByText('Review')).not.toHaveAttribute('data-error');
  },
};

export const Locked: Story = {
  args: {
    steps: STEPS.map((step, i) =>
      i === 0 ? step : { ...step, status: 'locked', message: undefined },
    ),
  },
};

/** A submitted, read-only form: the nav only navigates. */
export const WithoutStatusIcons: Story = {
  args: { hideStatusIcons: true },
};
