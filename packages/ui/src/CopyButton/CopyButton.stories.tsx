import type { Meta, StoryObj } from '@storybook/react-vite';

import { CopyButton } from './CopyButton';

const meta: Meta<typeof CopyButton> = {
  title: 'Actions/CopyButton',
  component: CopyButton,
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    copiedLabel: { control: 'text' },
  },
  args: {
    value: 'waldur_api_token_sample_xyz123',
    label: 'Copy API token',
    copiedLabel: 'Copied!',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A copy-to-clipboard button component built on BaseButton (tertiary variant) with built-in transient feedback timing for copied status.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof CopyButton>;

export const Playground: Story = {};

export const ContextUsage: Story = {
  render: () => (
    <div className="p-5 bg-[var(--page-bg)] space-y-4 max-w-md">
      <div className="flex items-center justify-between p-2.5 rounded-md border-[1px] border-secondary bg-[var(--card-bg)]">
        <div>
          <div className="text-xs text-quinary">API Token</div>
          <div className="font-mono text-xs text-primary">ab73...9f12</div>
        </div>
        <CopyButton
          value="ab7349128502391298492849"
          label="Copy token"
          copiedLabel="Copied!"
        />
      </div>

      <div className="flex items-center justify-between p-2.5 rounded-md border-[1px] border-secondary bg-[var(--card-bg)]">
        <div>
          <div className="text-xs text-quinary">Public IP</div>
          <div className="font-mono text-xs text-primary">192.168.1.42</div>
        </div>
        <CopyButton
          value="192.168.1.42"
          label="Copy IP"
          copiedLabel="Copied!"
        />
      </div>
    </div>
  ),
};
