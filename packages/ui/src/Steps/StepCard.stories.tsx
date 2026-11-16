import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { BaseButton } from '../Button';
import { FormField, FormLabel } from '../Form';
import { Input } from '../Input';
import { Select } from '../Select';

import { StepAccordionCard, StepCard, StepLock } from './StepCard';

const PLAN_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'large', label: 'Large' },
];

const Fields = () => (
  <div className="flex flex-col gap-4">
    <FormField controlId="story-name">
      <FormLabel>Name</FormLabel>
      <Input id="story-name" defaultValue="my-vm" />
    </FormField>
    <FormField controlId="story-plan">
      <FormLabel>Plan</FormLabel>
      <Select inputId="story-plan" options={PLAN_OPTIONS} />
    </FormField>
  </div>
);

const meta: Meta<typeof StepCard> = {
  title: 'Wizard/StepCard',
  component: StepCard,
  parameters: {
    docs: {
      description: {
        component:
          'One step of a long, single-page form (an order form, a proposal), which a `StepNav` scrolls to by `id`. `disabled` locks the step: its fields and header actions are disabled and `inert`, and `disabledReason` is shown above them.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-160 p-5 bg-secondary">
        <Story />
      </div>
    ),
  ],
  args: {
    id: 'step-details',
    title: 'Details',
    children: <Fields />,
  },
};

export default meta;

type Story = StoryObj<typeof StepCard>;

export const Default: Story = {};

export const WithSubtitleAndActions: Story = {
  args: {
    subtitle: 'Name the resource and pick a plan.',
    actions: <BaseButton variant="tertiary" size="sm" label="Reset" />,
    refetch: () => undefined,
  },
};

export const Locked: Story = {
  args: {
    disabled: true,
    disabledReason: 'Select an organization and project to proceed.',
    actions: <BaseButton variant="tertiary" size="sm" label="Reset" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('step-details')).toHaveAttribute(
      'data-state',
      'locked',
    );
    await expect(canvas.getByLabelText('Name')).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Reset' })).toBeDisabled();
    await expect(
      canvas.getByText('Select an organization and project to proceed.'),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  args: { loading: true },
};

/** `StepLock` on its own, for a step drawn in a card of its own. */
export const LockOnly: StoryObj<typeof StepLock> = {
  render: () => (
    <StepLock disabled disabledReason="This step opens once a plan is chosen.">
      <Fields />
    </StepLock>
  ),
};

/**
 * A step drawn as an accordion, locked: it stays open with its reason, can't
 * be folded, and is marked like a locked `StepCard`.
 */
export const LockedAccordion: StoryObj<typeof StepAccordionCard> = {
  render: () => (
    <StepAccordionCard
      id="step-scheduling"
      title="Scheduling"
      disabled
      disabledReason="Select an organization and project to proceed."
    >
      <Fields />
    </StepAccordionCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvasElement.querySelector(
      '[data-slot="accordion-card"]',
    ) as HTMLElement;
    await expect(card).toHaveAttribute('data-state', 'locked');
    // Open although it would start folded, with its reason and locked fields.
    await expect(
      canvas.getByText('Select an organization and project to proceed.'),
    ).toBeVisible();
    await expect(canvas.getByLabelText('Name')).toBeDisabled();
    // Neither toggle (the title, the caret) can fold it or take focus.
    for (const toggle of canvas.getAllByRole('button')) {
      await expect(toggle).toBeDisabled();
    }
  },
};
