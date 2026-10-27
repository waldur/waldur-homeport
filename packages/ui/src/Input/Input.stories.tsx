import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './Input';
import { InputGroup } from './InputGroup';
import { StateGrid } from './storyHelpers';

const meta: Meta<typeof Input> = {
  title: 'Forms/Text inputs/Input',
  component: Input,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
    solid: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    size: 'md',
    type: 'text',
    solid: false,
    invalid: false,
    disabled: false,
    readOnly: false,
    placeholder: 'Enter a name...',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A native `<input>` with the shared input look (40px `md`, sized in px so it matches in waldur-homeport and the micro-apps). `invalid` draws the error border and sets `aria-invalid`; wrap it in an `InputGroup invalid` for the warning icon. `solid` swaps the outline for a filled surface. Number inputs never show spin buttons. Inside a `FormGroup` use `BaseInputField` from `@/form`; for a react-final-form field see Form fields.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-[420px] p-5">
      <Input aria-label="Playground" {...args} />
    </div>
  ),
};

const STATES = [
  ['Default', {}],
  ['Filled', { defaultValue: 'Alpha project' }],
  ['Invalid', { defaultValue: 'Alpha project', invalid: true }],
  ['Disabled', { defaultValue: 'Alpha project', disabled: true }],
  ['Read only', { defaultValue: 'Alpha project', readOnly: true }],
  ['Number', { type: 'number', defaultValue: 42 }],
] as const;

export const States: Story = {
  render: () => (
    <StateGrid
      rows={STATES.map(([label, props]) => [
        label,
        (solid) => (
          <InputGroup invalid={'invalid' in props}>
            <Input
              aria-label={solid ? `${label} solid` : label}
              placeholder="Placeholder"
              solid={solid}
              {...props}
            />
          </InputGroup>
        ),
      ])}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-[420px] flex-col gap-3 p-5">
      <Input aria-label="Small" size="sm" placeholder="Small" />
      <Input aria-label="Medium" placeholder="Medium (default)" />
      <Input aria-label="Large" size="lg" placeholder="Large" />
    </div>
  ),
};
