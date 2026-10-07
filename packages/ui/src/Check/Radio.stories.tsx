import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'Forms/Check controls/Radio',
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          'RadioGroup: options in, one value out, as native radios in a fieldset whose legend is the label. A lone `Radio` (20px `md`, 16px `sm`) is for layouts the group does not cover, such as a radio per table row.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Group: Story = {
  render: () => {
    const [period, setPeriod] = useState('monthly');
    const [format, setFormat] = useState('csv');
    return (
      <div className="p-6 flex flex-col gap-[32px] max-w-[480px]">
        <RadioGroup
          label="Billing period"
          tooltip="Applies from the next invoice."
          value={period}
          onValueChange={setPeriod}
          options={[
            {
              value: 'monthly',
              label: 'Monthly',
              description: 'Invoiced on the first of each month.',
            },
            {
              value: 'annual',
              label: 'Annual',
              description: 'One invoice a year, prepaid.',
            },
            {
              value: 'usage',
              label: 'Usage-based',
              description: 'Billed from reported component usage.',
              disabled: true,
            },
          ]}
        />
        <RadioGroup
          label="Export format"
          orientation="horizontal"
          value={format}
          onValueChange={setFormat}
          options={[
            { value: 'csv', label: 'CSV' },
            { value: 'xlsx', label: 'Excel' },
            { value: 'pdf', label: 'PDF' },
          ]}
        />
      </div>
    );
  },
};

const STATES = [
  ['Unselected', { checked: false }],
  ['Selected', { checked: true }],
  ['Disabled', { checked: false, disabled: true }],
  ['Disabled, selected', { checked: true, disabled: true }],
] as const;

export const AllStates: Story = {
  render: () => (
    <div className="p-6 grid grid-cols-[auto_auto_auto] items-center gap-4 text-sm">
      <span />
      <span>md</span>
      <span>sm</span>
      {STATES.map(([label, props]) => (
        <Fragment key={label}>
          <span>{label}</span>
          <Radio {...props} readOnly aria-label={label} />
          <Radio {...props} size="sm" readOnly aria-label={label} />
        </Fragment>
      ))}
    </div>
  ),
};

export const Keyboard: Story = {
  render: () => {
    const [period, setPeriod] = useState('monthly');
    return (
      <div className="p-6 max-w-[480px]">
        <RadioGroup
          label="Billing period"
          value={period}
          onValueChange={setPeriod}
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'annual', label: 'Annual' },
            { value: 'usage', label: 'Usage-based', disabled: true },
            { value: 'prepaid', label: 'Prepaid' },
          ]}
        />
        <button type="button">After</button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // One tab stop, entered on the selected option.
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'Monthly' })).toHaveFocus();
    // Arrows move focus and selection together, and skip a disabled option.
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Annual' })).toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Prepaid' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Prepaid' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Monthly' })).toBeChecked();
    // Tab leaves the group in one step.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'After' })).toHaveFocus();
  },
};
