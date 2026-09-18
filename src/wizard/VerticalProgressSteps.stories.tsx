import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ProgressStep } from './ProgressSteps';
import { VerticalProgressSteps } from './VerticalProgressSteps';

const meta: Meta<typeof VerticalProgressSteps> = {
  title: 'Navigation/VerticalProgressSteps',
  component: VerticalProgressSteps,
  parameters: {
    docs: {
      description: {
        component:
          'Vertical wizard progress steps component showing sequential steps with connecting lines, active outline rings, and completion checkmarks.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-body" style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof VerticalProgressSteps>;

const sampleSteps: ProgressStep[] = [
  {
    key: 'method',
    label: 'Verification method',
    description: 'Select automatic or manual verification',
    completed: true,
  },
  {
    key: 'identification',
    label: 'Identification',
    description: 'Enter organization details and registry code',
    completed: false,
  },
  {
    key: 'result',
    label: 'Validation result',
    description: 'Review the validation outcome',
    completed: false,
  },
  {
    key: 'intent',
    label: 'Intent and justification',
    description: 'Specify the purpose of organization creation',
    completed: false,
  },
];

export const Default: Story = {
  args: {
    steps: sampleSteps,
  },
};

export const ExplicitCurrentStep: Story = {
  args: {
    // "Current" isn't a prop — it's derived from completed transitions in
    // the steps array (the first step after the last completed one), so
    // marking index 0-1 completed makes index 2 ('result') the current one.
    steps: sampleSteps.map((s, idx) => ({ ...s, completed: idx < 2 })),
  },
};

export const AllCompleted: Story = {
  args: {
    steps: sampleSteps.map((s) => ({ ...s, completed: true })),
  },
};

export const VariantSuccess: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the vertical stepper with a per-step `variant: "success"` on the current step, which renders it with a light-success halo outline.',
      },
    },
  },
  args: {
    // sampleSteps[0] is completed, so index 1 ('identification') is the
    // current step — variant is set there, not on the component itself.
    steps: sampleSteps.map((s, idx) =>
      idx === 1 ? { ...s, variant: 'success' } : s,
    ),
  },
};

export const VariantDanger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the vertical stepper with danger variant, rendering the active or failed step in red with matching halo outline.',
      },
    },
  },
  args: {
    steps: [
      {
        key: 'method',
        label: 'Verification method',
        description: 'Select automatic or manual verification',
        completed: true,
      },
      {
        key: 'identification',
        label: 'Identification failed',
        description: 'Organization registry code could not be verified',
        completed: false,
        variant: 'danger',
      },
      {
        key: 'result',
        label: 'Validation result',
        description: 'Review the validation outcome',
        completed: false,
      },
      {
        key: 'intent',
        label: 'Intent and justification',
        description: 'Specify the purpose of organization creation',
        completed: false,
      },
    ],
  },
};

export const Interactive: Story = {
  render: function InteractiveVerticalStory() {
    const [activeIdx, setActiveIdx] = useState(1);
    const steps: ProgressStep[] = sampleSteps.map((s, idx) => ({
      ...s,
      completed: idx < activeIdx,
    }));

    return (
      <div className="d-flex flex-column gap-4">
        <VerticalProgressSteps
          steps={steps}
          onClick={(_, idx) => setActiveIdx(idx)}
        />
        <div className="text-muted small">
          Click completed steps or current step to navigate
        </div>
      </div>
    );
  },
};
