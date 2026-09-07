import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Primitives/Switch',
  component: Switch,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    checked: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Accessible toggle switch component using native checkbox semantics and brand-colored track animations. Drop-in replacement for Bootstrap .form-switch.',
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
      <div className="p-6 flex items-center gap-4">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
        <span className="text-sm font-medium text-[var(--surface-text-primary)]">
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
      <div className="p-6 bg-[var(--surface-page-bg)] max-w-md space-y-4">
        <div className="flex items-center justify-between p-3 rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)]">
          <div>
            <div className="text-sm font-semibold text-[var(--surface-text-primary)]">
              Email Notifications
            </div>
            <div className="text-xs text-[var(--surface-text-secondary)]">
              Receive alert summaries on resource threshold breaches
            </div>
          </div>
          <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
        </div>

        <div className="flex items-center justify-between p-3 rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)]">
          <div>
            <div className="text-sm font-semibold text-[var(--surface-text-primary)]">
              Two-Factor Authentication
            </div>
            <div className="text-xs text-[var(--surface-text-secondary)]">
              Require OTP verification for administrative changes
            </div>
          </div>
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
        </div>
      </div>
    );
  },
};
