import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { NumberInput, NumberInputProps } from './NumberInput';
import { StateGrid } from './storyHelpers';

const meta: Meta<typeof NumberInput> = {
  title: 'Forms/Number/Number input',
  component: NumberInput,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    solid: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    showSteppers: { control: 'boolean' },
    stepperLayout: { control: 'inline-radio', options: ['carets', 'buttons'] },
    unit: { control: 'text' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
  args: {
    min: 1,
    max: 20,
    step: 1,
    showSteppers: true,
    stepperLayout: 'carets',
    unit: '',
  },
  parameters: {
    docs: {
      description: {
        component:
          'The app\'s one number control. The steppers move by `step`, rounded to its precision (0.1 + 0.2 stays 0.3), and stay in `min`..`max`. A value outside the range shows as invalid and is pulled back to the limit when the field is left; an empty field is left empty. Controlled: `value` and `onValueChange` (text while typing, a number after a stepper click or a clamp).\n\nPick the steppers by what the number is:\n- **carets** (default): any quantity or size.\n- **buttons** (`stepperLayout="buttons"`): a count picked a step at a time (nodes, units); bigger targets, value centred.\n- **none** (`showSteppers={false}`): a price or any value with many decimals, where a step is invisible.\n\nIn react-final-form use `NumberGroup` / `NumberField` from `@/form`; with a slider, `SliderNumberInput`.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof NumberInput>;

/** A NumberInput holding its own value, as a form would. */
const Controlled = ({
  initial = 5,
  ...props
}: Omit<NumberInputProps, 'value' | 'onValueChange'> & {
  initial?: number | string;
}) => {
  const [value, setValue] = useState<number | string>(initial);
  return <NumberInput value={value} onValueChange={setValue} {...props} />;
};

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-[420px] p-5">
      <Controlled aria-label="Playground" {...args} />
    </div>
  ),
};

/** The three stepper choices, each with the kind of value it suits. */
export const StepperLayouts: Story = {
  render: () => (
    <div className="grid max-w-[720px] grid-cols-[160px_1fr] items-center gap-3 p-5">
      <span className="text-sm text-secondary">Carets: a size</span>
      <Controlled aria-label="Size" initial={40} min={1} max={500} unit="GB" />
      <span className="text-sm text-secondary">Buttons: a count</span>
      <Controlled
        aria-label="Nodes"
        initial={3}
        min={1}
        max={10}
        stepperLayout="buttons"
      />
      <span className="text-sm text-secondary">None: a price</span>
      <Controlled
        aria-label="Price"
        initial={0.0042}
        min={0}
        step={0.0000001}
        showSteppers={false}
        unit="EUR"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nodes = canvas.getByLabelText('Nodes');
    await userEvent.click(
      canvas.getAllByRole('button', { name: 'Increase value' })[1],
    );
    await expect(nodes).toHaveValue(4);
    await userEvent.click(
      canvas.getAllByRole('button', { name: 'Decrease value' })[1],
    );
    await expect(nodes).toHaveValue(3);
    // The price has no steppers: only the size's and the count's pairs.
    await expect(
      canvas.getAllByRole('button', { name: 'Increase value' }),
    ).toHaveLength(2);
  },
};

const STATES = [
  ['Default', { value: 5 }],
  ['With unit', { value: 5, unit: 'GB' }],
  ['Buttons', { value: 3, stepperLayout: 'buttons' }],
  ['No steppers', { value: 1.5, showSteppers: false, unit: 'EUR' }],
  ['Out of range', { value: 50 }],
  ['Invalid', { value: 5, invalid: true }],
  ['Disabled', { value: 3, disabled: true }],
  ['Buttons, disabled', { value: 3, stepperLayout: 'buttons', disabled: true }],
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Out of range')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    for (const label of ['Disabled', 'Buttons, disabled']) {
      await expect(canvas.getByLabelText(label)).toBeDisabled();
    }
  },
};

/** Type 50 and leave the field: it turns invalid, then snaps back to 20. */
export const Clamping: Story = {
  render: () => {
    const [value, setValue] = useState<number | string>(5);
    return (
      <div className="flex max-w-[420px] flex-col gap-1.5 p-5">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('Between 1 and 20');
    await userEvent.clear(field);
    await userEvent.type(field, '50');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await userEvent.tab();
    await expect(field).toHaveValue(20);
    await expect(field).not.toHaveAttribute('aria-invalid');
    // Emptied, the field stays empty and valid: it is not forced to min.
    await userEvent.clear(field);
    await userEvent.tab();
    await expect(field).toHaveValue(null);
    await expect(field).not.toHaveAttribute('aria-invalid');
  },
};

/** Three clicks of 0.1 make 0.3, not 0.30000000000000004. */
export const StepPrecision: Story = {
  render: () => (
    <div className="max-w-[420px] p-5">
      <Controlled aria-label="Ratio" initial={0} min={0} max={1} step={0.1} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const increase = canvas.getByRole('button', { name: 'Increase value' });
    await userEvent.click(increase);
    await userEvent.click(increase);
    await userEvent.click(increase);
    await expect(canvas.getByLabelText('Ratio')).toHaveValue(0.3);
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="grid max-w-[720px] grid-cols-2 gap-3 p-5">
      {(['sm', 'md', 'lg'] as const).map((size) => [
        <Controlled
          key={`${size}-c`}
          aria-label={`${size} carets`}
          size={size}
        />,
        <Controlled
          key={`${size}-b`}
          aria-label={`${size} buttons`}
          size={size}
          stepperLayout="buttons"
        />,
      ])}
    </div>
  ),
};
