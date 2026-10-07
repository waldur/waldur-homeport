import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, useState } from 'react';

import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Check controls/Checkbox',
  component: Checkbox,
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    label: { control: 'text' },
    description: { control: 'text' },
    tooltip: { control: 'text' },
  },
  args: {
    size: 'md',
    disabled: false,
    indeterminate: false,
    label: 'Send me a weekly digest',
    description: 'A summary of usage and costs every Monday.',
    tooltip: '',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A hidden native checkbox under a drawn box, check and dash (20px `md`, 16px `sm`). Pass `label` (and `description`, `tooltip`) for the whole row; leave it out for a bare control with an `aria-label`, as in a table.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="p-6">
        <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />
      </div>
    );
  },
};

const STATES = [
  ['Unchecked', { checked: false }],
  ['Checked', { checked: true }],
  ['Indeterminate', { checked: false, indeterminate: true }],
  ['Disabled', { checked: false, disabled: true }],
  ['Disabled, checked', { checked: true, disabled: true }],
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
          <Checkbox {...props} readOnly aria-label={label} />
          <Checkbox {...props} size="sm" readOnly aria-label={label} />
        </Fragment>
      ))}
    </div>
  ),
};

export const Labelled: Story = {
  render: () => {
    const [skip, setSkip] = useState(false);
    return (
      <div className="p-6 flex flex-col gap-[16px] max-w-[480px]">
        <Checkbox
          label="Update all selected resource termination dates to match project end date"
          size="sm"
          checked={skip}
          onCheckedChange={setSkip}
        />
        <Checkbox
          label="Include SLURM policy settings"
          tooltip="Adds the offering's periodic usage policy, if it has one."
          defaultChecked
        />
        <Checkbox
          label="Terms of Service accepted"
          description="Accepted on 2026-09-14 10:32."
          defaultChecked
          disabled
        />
      </div>
    );
  },
};
