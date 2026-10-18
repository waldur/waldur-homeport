import type { Meta, StoryObj } from '@storybook/react-vite';

import { InputGroup } from './InputGroup';
import { StateGrid } from './storyHelpers';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Text inputs/Textarea',
  component: Textarea,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    solid: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    rows: { control: 'number' },
  },
  args: {
    size: 'md',
    solid: false,
    invalid: false,
    disabled: false,
    readOnly: false,
    rows: 4,
    placeholder: 'Describe the change...',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A multi-line `<textarea>` with the same look as `Input`. It resizes vertically; pass `className="resize-none"` to fix its height. Wrap it in `<InputGroup invalid align="top">` for the warning icon in the top corner. Inside a `FormGroup` use `BaseTextField` from `@/form`.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-[420px] p-6">
      <Textarea aria-label="Playground" {...args} />
    </div>
  ),
};

const STATES = [
  ['Default', {}],
  ['Filled', { defaultValue: 'A short description\nover two lines.' }],
  ['Invalid', { defaultValue: 'Too short', invalid: true }],
  ['Disabled', { defaultValue: 'Locked text', disabled: true }],
  ['Read only', { defaultValue: 'Read only text', readOnly: true }],
] as const;

export const States: Story = {
  render: () => (
    <StateGrid
      rows={STATES.map(([label, props]) => [
        label,
        (solid) => (
          <InputGroup invalid={'invalid' in props} align="top">
            <Textarea
              aria-label={solid ? `${label} solid` : label}
              rows={3}
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
    <div className="flex max-w-[420px] flex-col gap-4 p-6">
      <Textarea aria-label="Small" size="sm" rows={2} placeholder="Small" />
      <Textarea aria-label="Medium" rows={2} placeholder="Medium (default)" />
      <Textarea aria-label="Large" size="lg" rows={2} placeholder="Large" />
    </div>
  ),
};
