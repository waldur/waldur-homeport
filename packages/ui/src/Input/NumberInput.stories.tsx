import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { NumberInput } from './NumberInput';
import { StateGrid } from './storyHelpers';

const meta: Meta<typeof NumberInput> = {
  title: 'Forms/Text inputs/Number input',
  component: NumberInput,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    solid: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    showSteppers: { control: 'boolean' },
    unit: { control: 'text' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
  args: { min: 1, max: 20, step: 1, showSteppers: true, unit: '' },
  parameters: {
    docs: {
      description: {
        component:
          'A number input with optional up/down steppers and a unit. The steppers move by `step`, rounded to its precision (0.1 + 0.2 stays 0.3), and stay in `min`..`max`. A value outside the range shows as invalid and is pulled back to the limit when the field is left; an empty field is left empty. Controlled: `value` and `onValueChange` (text while typing, a number after a stepper click or a clamp). Turn the steppers off for a price, whose many decimals make a stepper pointless. In react-final-form use `NumberField` from `@/form`.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof NumberInput>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState<number | string>(5);
    return (
      <div className="max-w-[420px] p-6">
        <NumberInput
          aria-label="Playground"
          {...args}
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
};

const STATES = [
  ['Default', { value: 5 }],
  ['With unit', { value: 5, unit: 'GB' }],
  ['No steppers', { value: 1.5, showSteppers: false, unit: 'EUR' }],
  ['Out of range', { value: 50 }],
  ['Invalid', { value: 5, invalid: true }],
  ['Disabled', { value: 3, disabled: true }],
] as const;

export const States: Story = {
  render: () => (
    <StateGrid
      rows={STATES.map(([label, props]) => [
        label,
        (solid) => (
          <NumberInput
            aria-label={solid ? `${label} solid` : label}
            min={1}
            max={20}
            solid={solid}
            onValueChange={() => {}}
            {...props}
          />
        ),
      ])}
    />
  ),
};

/** Type 50 and leave the field: it turns invalid, then snaps back to 20. */
export const Clamping: Story = {
  render: () => {
    const [value, setValue] = useState<number | string>(5);
    return (
      <div className="flex max-w-[420px] flex-col gap-2 p-6">
        <NumberInput
          aria-label="Between 1 and 20"
          value={value}
          min={1}
          max={20}
          onValueChange={setValue}
        />
        <span className="text-sm text-tertiary">Value: {String(value)}</span>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-[420px] flex-col gap-4 p-6">
      <NumberInput
        aria-label="Small"
        size="sm"
        value={5}
        onValueChange={() => {}}
      />
      <NumberInput aria-label="Medium" value={5} onValueChange={() => {}} />
      <NumberInput
        aria-label="Large"
        size="lg"
        value={5}
        onValueChange={() => {}}
      />
    </div>
  ),
};
