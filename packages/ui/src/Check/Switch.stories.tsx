import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, useState } from 'react';

import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Forms/Check controls/Switch',
  component: Switch,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
  args: {
    checked: false,
    disabled: false,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A hidden native checkbox with a drawn track and knob (`peer-*`). Replaces the Bootstrap `.form-switch` / `.form-switch-sm` (44×24 / 36×20); pass `label` for the whole row.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Interactive: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(false);
    return (
      <div className="p-5 flex items-center gap-3">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
        <span className="text-sm font-medium text-primary">
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    );
  },
};

export const InSettingsRow: Story = {
  render: () => {
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);

    return (
      <div className="p-5 bg-[var(--page-bg)] max-w-md space-y-4">
        <div className="flex items-center justify-between p-2.5 rounded-md border-[1px] border-secondary bg-[var(--card-bg)]">
          <div>
            <div className="text-sm font-semibold text-primary">
              Email Notifications
            </div>
            <div className="text-xs text-quaternary">
              Receive alert summaries on resource threshold breaches
            </div>
          </div>
          <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-md border-[1px] border-secondary bg-[var(--card-bg)]">
          <div>
            <div className="text-sm font-semibold text-primary">
              Two-Factor Authentication
            </div>
            <div className="text-xs text-quaternary">
              Require OTP verification for administrative changes
            </div>
          </div>
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
        </div>
      </div>
    );
  },
};

export const States: Story = {
  render: () => (
    <div className="p-5 grid grid-cols-[auto_auto_auto] items-center gap-3 text-sm">
      <span />
      <span>md</span>
      <span>sm</span>
      {(
        [
          ['Off', false, false],
          ['On', true, false],
          ['Off, disabled', false, true],
          ['On, disabled', true, true],
        ] as const
      ).map(([label, checked, disabled]) => (
        <Fragment key={label}>
          <span>{label}</span>
          <Switch
            checked={checked}
            disabled={disabled}
            aria-label={label}
            onCheckedChange={() => undefined}
          />
          <Switch
            size="sm"
            checked={checked}
            disabled={disabled}
            aria-label={label}
            onCheckedChange={() => undefined}
          />
        </Fragment>
      ))}
    </div>
  ),
};

export const Labelled: Story = {
  render: () => {
    const [on, setOn] = useState(true);
    return (
      <div className="p-5">
        <Switch
          checked={on}
          onCheckedChange={setOn}
          label="Enable notifications"
          description="Email me when an order changes state."
        />
      </div>
    );
  },
};
