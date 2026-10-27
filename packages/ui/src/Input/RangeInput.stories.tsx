import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { RangeInput } from './RangeInput';

const meta: Meta<typeof RangeInput> = {
  title: 'Forms/Text inputs/Range input',
  component: RangeInput,
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: { min: 0, max: 100, step: 5, disabled: false },
  parameters: {
    docs: {
      description: {
        component:
          "A native range slider whose track fills up to the thumb in the brand colour. Controlled by `value`; `onChange` is the input's own change event. Show the value beside it: a slider alone does not say what it is set to.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof RangeInput>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState(35);
    return (
      <div className="flex max-w-[420px] flex-col gap-2.5 p-5">
        <RangeInput
          aria-label="Minimum match score"
          {...args}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <div className="flex justify-between text-sm text-tertiary">
          <span>{args.min ?? 0}%</span>
          <strong className="text-primary">{value}%</strong>
          <span>{args.max ?? 100}%</span>
        </div>
      </div>
    );
  },
};

export const States: Story = {
  render: () => (
    <div className="flex max-w-[420px] flex-col gap-5 p-5">
      {[0, 35, 100].map((value) => (
        <RangeInput
          key={value}
          aria-label={`At ${value}`}
          value={value}
          onChange={() => {}}
        />
      ))}
      <RangeInput
        aria-label="Disabled"
        value={60}
        disabled
        onChange={() => {}}
      />
    </div>
  ),
};
