import { ArrowRightIcon, CaretRightIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, ReactNode } from 'react';

import { BaseButton } from './BaseButton';

const CONTAINED_VARIANTS = [
  'primary',
  'secondary',
  'tertiary',
  'danger',
  'warning',
] as const;

const TEXT_VARIANTS = [
  'text-primary',
  'text-secondary',
  'text-danger',
  'text-warning',
] as const;

// Design-spec label per variant — "Error", not the prop's own "danger",
// matches the Figma naming (Shared components → Buttons) without renaming
// the actual variant prop, which "danger" is elsewhere in the app for.
const VARIANT_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  danger: 'Error',
  warning: 'Warning',
  'text-primary': 'Primary',
  'text-secondary': 'Secondary',
  'text-danger': 'Error',
  'text-warning': 'Warning',
};

const STATES = [
  'enabled',
  'hovered',
  'focused',
  'pressed',
  'disabled',
] as const;
type State = (typeof STATES)[number];

const STATE_LABELS: Record<State, string> = {
  enabled: 'Enabled',
  hovered: 'Hovered',
  focused: 'Focused',
  pressed: 'Pressed',
  disabled: 'Disabled',
};

const stateId = (state: State, variant: string) =>
  `state-btn-${state}-${variant}`;

const meta: Meta<typeof BaseButton> = {
  // Kept alongside waldur-homeport's own Core/Buttons/BaseButton story
  // (the Bootstrap original) in the Storybook sidebar for side-by-side
  // browsing, even though this component now lives in a different
  // package — pure UI-organization choice, unrelated to file location.
  title: 'Primitives/BaseButton',
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
    variant: {
      control: 'select',
      options: [...CONTAINED_VARIANTS, ...TEXT_VARIANTS],
    },
    size: { control: 'radio', options: ['sm', 'lg'] },
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

/**
 * State × variant grid, matching the design spec (Shared components →
 * Buttons): every color variant across one axis, every interaction state
 * down the other, in a single view — not five separate stories a reader
 * has to flip between to compare. Real pseudo-classes, not screenshots:
 * storybook-addon-pseudo-states rewrites the stylesheet so
 * `:hover`/`:focus-visible`/`:active` can be forced onto one row's ids at
 * a time while every other row stays in its own natural state — see the
 * addon's "Targeting specific elements" docs (a selector array on
 * `parameters.pseudo`, keyed by id, rather than the all-or-nothing
 * `pseudo: { hover: true }` the single-state stories below still use).
 *
 * One icon, not the spec's two (a leading arrow *and* a trailing one):
 * BaseButton takes a single `iconNode` + `iconRight` side toggle, not a
 * pair — the spec's mirrored arrows read as generic directional
 * placeholders rather than a real two-icon button shape, so this matches
 * the component's actual, real-usage API instead of drawing something
 * BaseButton can't render.
 */
const StateGrid = ({
  variants,
  icon,
}: {
  variants: readonly string[];
  icon: ReactNode;
}) => (
  // Not a data table — a Storybook-only state/variant reference grid, so
  // @/table/Table (paginated, sortable, backed by useTable) doesn't apply.
  // eslint-disable-next-line waldur-custom/no-hand-rolled-table
  <table className="border-collapse">
    <thead>
      <tr>
        <th className="w-28" />
        {variants.map((variant) => (
          <th
            key={variant}
            className="px-3 pb-3 text-left text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]"
          >
            {VARIANT_LABELS[variant] ?? variant}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {STATES.map((state) => (
        <tr key={state}>
          <th className="whitespace-nowrap px-2 py-2 text-right align-middle text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]">
            {STATE_LABELS[state]}
          </th>
          {variants.map((variant) => (
            <td key={variant} className="p-2">
              <BaseButton
                id={stateId(state, variant)}
                variant={
                  variant as ComponentProps<typeof BaseButton>['variant']
                }
                size="lg"
                label="Label"
                iconNode={icon}
                iconRight
                disabled={state === 'disabled'}
                disabledReason={
                  state === 'disabled'
                    ? 'Disabled for the state matrix'
                    : undefined
                }
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

// Every id from one state's row, across every variant column — the exact
// shape storybook-addon-pseudo-states' selector-array targeting expects.
const pseudoForRows = (variants: readonly string[]) => ({
  hover: variants.map((variant) => `#${stateId('hovered', variant)}`),
  focusVisible: variants.map((variant) => `#${stateId('focused', variant)}`),
  active: variants.map((variant) => `#${stateId('pressed', variant)}`),
});

export const ContainedStates: Story = {
  render: () => (
    <StateGrid
      variants={CONTAINED_VARIANTS}
      icon={<ArrowRightIcon weight="bold" />}
    />
  ),
  parameters: { pseudo: pseudoForRows(CONTAINED_VARIANTS) },
};

export const TextStates: Story = {
  render: () => (
    <StateGrid
      variants={TEXT_VARIANTS}
      icon={<CaretRightIcon weight="bold" />}
    />
  ),
  parameters: { pseudo: pseudoForRows(TEXT_VARIANTS) },
};
