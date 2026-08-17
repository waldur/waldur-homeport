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
  // Kept alongside waldur-homeport's own Core/Buttons/BaseButton story
  // (the Bootstrap original) in the Storybook sidebar for side-by-side
  // browsing, even though this component now lives in a different
  // package — pure UI-organization choice, unrelated to file location.
  title: 'Core/Buttons/BaseButtonTw',
  component: BaseButton,
  parameters: {
    // Every per-state color choice was verified empirically against the
    // real BaseButton — see docs/tailwind-shadcn-migration-notes.md.
    docs: {
      description: {
        component:
          'Tailwind/shadcn rebuild of BaseButton (see waldur-homeport/src/core/buttons/BaseButton.stories.tsx for the original). Not yet wired into production — see BaseButton.tsx.',
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

/** Single button, full controls — for exploring one variant/state combo. */
export const Playground: Story = {};

/** Every variant × size in one grid. */
const Matrix = (args: Partial<React.ComponentProps<typeof BaseButton>>) => (
  <div className="flex flex-col gap-2">
    {VARIANTS.map((variant) => (
      <div key={variant} className="flex items-center gap-3">
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

/**
 * Forces :hover via storybook-addon-pseudo-states (rewrites stylesheets to
 * add a class-name selector for the pseudo-class) instead of real pointer
 * simulation — sidesteps the exact fragility this migration hit with
 * Playwright: a raw DOM .focus()/.hover() call doesn't reliably settle a
 * CSS transition before the next read, and :focus-visible specifically
 * isn't triggered by a synchronous .focus() at all in Chromium. See
 * docs/tailwind-shadcn-migration-notes.md.
 */
export const Hover: Story = {
  render: (args) => <Matrix {...args} />,
  parameters: { pseudo: { hover: true } },
};

export const FocusVisible: Story = {
  render: (args) => <Matrix {...args} />,
  parameters: { pseudo: { focusVisible: true } },
};
