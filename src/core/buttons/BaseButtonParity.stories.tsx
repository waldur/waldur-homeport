import type { Meta, StoryObj } from '@storybook/react-vite';

import { BaseButton as BaseButtonTw } from 'waldur-ui';

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

const Pair = ({
  variant,
  size,
  disabled,
}: {
  variant: (typeof VARIANTS)[number];
  size: (typeof SIZES)[number];
  disabled?: boolean;
}) => {
  const pairId = `${variant}-${size}${disabled ? '-disabled' : ''}`;
  return (
    <div className="flex items-center gap-3 bg-white p-2 dark:bg-neutral-950">
      <BaseButton
        variant={variant}
        size={size}
        label="Label"
        disabled={disabled}
        disabledReason={
          disabled ? 'Disabled for the parity harness' : undefined
        }
        data-pair={pairId}
        data-role="old"
      />
      <BaseButtonTw
        variant={variant}
        size={size}
        label="Label"
        disabled={disabled}
        disabledReason={
          disabled ? 'Disabled for the parity harness' : undefined
        }
        data-pair={pairId}
        data-role="new"
      />
    </div>
  );
};

const meta: Meta = {
  title: 'Migration/BaseButton Parity',
  parameters: {
    docs: {
      description: {
        component:
          'Old (Bootstrap) BaseButton and BaseButtonTw side by side, tagged data-pair/data-role, for e2e-visual/base-button-parity.spec.ts to screenshot-diff. Not a usage example — a migration verification fixture. Hover/focus-visible are exercised by the spec via real Playwright interaction, not rendered as separate states here.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

// One story with BOTH enabled and disabled pairs, matching the removed
// ParityPage.tsx exactly — e2e-visual/base-button-parity.spec.ts navigates
// here once per test (theme) and locates whichever pair a given test needs
// (data-pair="{id}" enabled, data-pair="{id}-disabled" disabled) from the
// same page, not by switching stories.
export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2 bg-white p-10 dark:bg-neutral-950">
      {VARIANTS.map((variant) =>
        SIZES.map((size) => (
          <Pair key={`${variant}-${size}`} variant={variant} size={size} />
        )),
      )}
      {VARIANTS.map((variant) =>
        SIZES.map((size) => (
          <Pair
            key={`${variant}-${size}-disabled`}
            variant={variant}
            size={size}
            disabled
          />
        )),
      )}
    </div>
  ),
};
