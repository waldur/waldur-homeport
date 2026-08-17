import type { Meta, StoryObj } from '@storybook/react-vite';

import { BaseButton } from './BaseButton';

const VARIANTS = [
  'primary',
  'secondary',
  'tertiary',
  'tertiary-ghost',
  'danger',
  'warning',
  'success',
  'text-primary',
  'text-secondary',
  'text-danger',
  'text-warning',
  'text-success',
] as const;

const SIZES = ['sm', 'lg'] as const;

const meta: Meta<typeof BaseButton> = {
  title: 'Core/Buttons/BaseButton',
  component: BaseButton,
  parameters: {
    docs: {
      description: {
        component:
          'The real (Bootstrap/Metronic) BaseButton — still what ships to production. See BaseButtonTw.stories.tsx for the Tailwind rebuild this is being compared against.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'radio', options: SIZES },
  },
  args: {
    label: 'Label',
    size: 'lg',
    variant: 'primary',
  },
};
export default meta;

type Story = StoryObj<typeof BaseButton>;

export const Playground: Story = {};

const Matrix = (args: Partial<React.ComponentProps<typeof BaseButton>>) => (
  <div className="d-flex flex-column gap-2">
    {VARIANTS.map((variant) => (
      <div key={variant} className="d-flex align-items-center gap-3">
        {SIZES.map((size) => (
          <BaseButton
            key={size}
            {...args}
            variant={variant}
            size={size}
            label={variant}
          />
        ))}
      </div>
    ))}
  </div>
);

export const AllVariants: Story = {
  render: (args) => <Matrix {...args} />,
};

export const Disabled: Story = {
  render: (args) => (
    <Matrix
      {...args}
      disabled
      disabledReason="Disabled for the Storybook matrix"
    />
  ),
};

export const Hover: Story = {
  render: (args) => <Matrix {...args} />,
  parameters: { pseudo: { hover: true } },
};

export const FocusVisible: Story = {
  render: (args) => <Matrix {...args} />,
  parameters: { pseudo: { focusVisible: true } },
};
