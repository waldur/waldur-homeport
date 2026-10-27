import type { Meta, StoryObj } from '@storybook/react-vite';

import { SecretInput } from './SecretInput';
import { StateGrid } from './storyHelpers';

const meta: Meta<typeof SecretInput> = {
  title: 'Forms/Text inputs/Secret input',
  component: SecretInput,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    solid: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: { size: 'md', solid: false, invalid: false, disabled: false },
  parameters: {
    docs: {
      description: {
        component:
          'A password-style input with a show/hide button inside its right edge. `autoComplete` defaults to `new-password`, so a browser does not fill a stored login into a token field. A read-only one shows a value the user can reveal and copy. In react-final-form use `SecretField` from `@/form`.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof SecretInput>;

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-[420px] p-5">
      <SecretInput
        aria-label="Playground"
        defaultValue="s3cr3t-token"
        {...args}
      />
    </div>
  ),
};

const STATES = [
  ['Default', {}],
  ['Invalid', { invalid: true }],
  ['Disabled', { disabled: true }],
  ['Read only', { readOnly: true }],
] as const;

export const States: Story = {
  render: () => (
    <StateGrid
      rows={STATES.map(([label, props]) => [
        label,
        (solid) => (
          <SecretInput
            aria-label={solid ? `${label} solid` : label}
            defaultValue="s3cr3t-token"
            solid={solid}
            {...props}
          />
        ),
      ])}
    />
  ),
};
