import { GearIcon, ShieldCheckIcon, UserIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ProgressStep, ProgressSteps } from './ProgressSteps';

const meta: Meta<typeof ProgressSteps> = {
  title: 'Navigation/ProgressSteps',
  component: ProgressSteps,
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal wizard progress steps component with support for completed, current, and pending steps, variant status outlines (e.g. danger), and custom icons.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-body" style={{ minWidth: 600 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProgressSteps>;

const defaultSteps: ProgressStep[] = [
  {
    key: 'step-1',
    label: 'Account Details',
    completed: true,
  },
  {
    key: 'step-2',
    label: 'Organization',
    completed: false,
  },
  {
    key: 'step-3',
    label: 'Review & Confirm',
    completed: false,
  },
];

export const Default: Story = {
  args: {
    steps: defaultSteps,
  },
};

export const WithDescriptions: Story = {
  args: {
    steps: [
      {
        key: 'step-1',
        label: 'Account',
        description: ['Provide contact info'],
        completed: true,
      },
      {
        key: 'step-2',
        label: 'Verification',
        description: ['Verify your identity'],
        completed: false,
      },
      {
        key: 'step-3',
        label: 'Confirmation',
        description: ['Review your application'],
        completed: false,
      },
    ],
  },
};

export const AllCompleted: Story = {
  args: {
    steps: defaultSteps.map((s) => ({ ...s, completed: true })),
  },
};

export const DangerVariant: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates non-default variant styling (e.g. `variant: "danger"` on the current step), which applies a red background and matching 4px danger outline.',
      },
    },
  },
  args: {
    steps: [
      {
        key: 'step-1',
        label: 'Submitted',
        completed: true,
      },
      {
        key: 'step-2',
        label: 'Review Canceled',
        description: ['Application canceled by user'],
        completed: false,
        variant: 'danger',
      },
      {
        key: 'step-3',
        label: 'Decision',
        completed: false,
      },
    ],
  },
};

export const CustomIcons: Story = {
  args: {
    steps: [
      {
        key: 'user',
        label: 'Profile',
        icon: <UserIcon size={14} weight="bold" />,
        completed: true,
      },
      {
        key: 'settings',
        label: 'Configuration',
        icon: <GearIcon size={14} weight="bold" />,
        completed: false,
      },
      {
        key: 'security',
        label: 'Security',
        icon: <ShieldCheckIcon size={14} weight="bold" />,
        completed: false,
      },
    ],
  },
};

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [currentIndex, setCurrentIndex] = useState(1);
    const labels = [
      'Plan Selection',
      'Resource Limits',
      'SSH Keys',
      'Final Review',
    ];
    const steps: ProgressStep[] = labels.map((label, idx) => ({
      key: label,
      label,
      completed: idx < currentIndex,
    }));

    return (
      <div className="d-flex flex-column gap-6">
        <ProgressSteps
          steps={steps}
          onClick={(_, idx) => setCurrentIndex(idx)}
        />
        <div className="text-center text-muted small">
          Click any step to switch the active step (current: Step{' '}
          {currentIndex + 1})
        </div>
      </div>
    );
  },
};
