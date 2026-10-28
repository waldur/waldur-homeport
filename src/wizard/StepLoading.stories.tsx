import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { StepLoading } from './StepLoading';

const meta: Meta<typeof StepLoading> = {
  title: 'Wizard/StepLoading',
  component: StepLoading,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Step discovery loading indicator for multi-step wizards. Replaces react-bootstrap Spinner with waldur-ui LoadingSpinner.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof StepLoading>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spinner = canvas.getByRole('status');
    await expect(spinner).toBeInTheDocument();
    await expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  },
};

export const WithMessage: Story = {
  args: {
    message: 'Discovering OpenStack projects and networks...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spinner = canvas.getByRole('status');
    await expect(spinner).toBeInTheDocument();
    await expect(spinner).toHaveAttribute(
      'aria-label',
      'Discovering OpenStack projects and networks...',
    );
    await expect(
      canvas.getByText('Discovering OpenStack projects and networks...'),
    ).toBeInTheDocument();
  },
};

export const CustomContainer: Story = {
  args: {
    message: 'Loading preview...',
    className:
      'border-[1px] border-dashed border-secondary rounded p-6 bg-primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Loading preview...')).toBeInTheDocument();
  },
};
