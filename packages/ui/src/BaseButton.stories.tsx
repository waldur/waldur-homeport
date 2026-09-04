import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, ReactNode } from 'react';

import { BaseButton } from './BaseButton';

const CONTAINED_VARIANTS = [
  'primary',
  'secondary',
  'tertiary',
  'danger',
  'warning',
  'success',
] as const;

const TEXT_VARIANTS = [
  'text-primary',
  'text-secondary',
  'text-danger',
  'text-warning',
  'text-success',
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
  success: 'Success',
  'text-primary': 'Primary',
  'text-secondary': 'Secondary',
  'text-danger': 'Error',
  'text-warning': 'Warning',
  'text-success': 'Success',
};

type Size = 'sm' | 'lg';
type IconSide = 'left' | 'right';

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

const ICONS: Record<IconSide, { arrow: ReactNode; caret: ReactNode }> = {
  left: {
    arrow: <ArrowLeftIcon weight="bold" />,
    caret: <CaretLeftIcon weight="bold" />,
  },
  right: {
    arrow: <ArrowRightIcon weight="bold" />,
    caret: <CaretRightIcon weight="bold" />,
  },
};

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
 * Size and icon side are Controls args, not extra grid rows/columns: the
 * spec shows one icon on *each* side of the label simultaneously, which
 * BaseButton's real API (a single `iconNode` + `iconRight` toggle) can't
 * render — doubling every row for left+right, and again for sm+lg, would
 * quadruple the grid into something worse to scan than the four toggles
 * in the Controls panel below it. Reach for the Playground story instead
 * when comparing two fixed combinations side by side matters more than
 * scanning every state.
 */
const StateGrid = ({
  variants,
  size,
  iconSide,
  iconShape,
}: {
  variants: readonly string[];
  size: Size;
  iconSide: IconSide;
  iconShape: 'arrow' | 'caret';
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
                size={size}
                label="Label"
                iconNode={ICONS[iconSide][iconShape]}
                iconRight={iconSide === 'right'}
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

// The two grid stories take `size`/`iconSide` args instead of BaseButton's
// own props (`iconSide` has no such prop at all — it's StateGrid's
// friendlier stand-in for `iconRight`), so they get their own StoryObj
// shape rather than reusing `Story` (= StoryObj<typeof BaseButton>) above.
interface GridArgs {
  size: Size;
  iconSide: IconSide;
}
type GridStory = StoryObj<GridArgs>;

const gridArgTypes: Meta<GridArgs>['argTypes'] = {
  size: { control: 'radio', options: ['sm', 'lg'] },
  iconSide: { control: 'radio', options: ['left', 'right'] },
};
const gridArgs: GridArgs = { size: 'lg', iconSide: 'right' };

export const ContainedStates: GridStory = {
  argTypes: gridArgTypes,
  args: gridArgs,
  render: ({ size, iconSide }) => (
    <StateGrid
      variants={CONTAINED_VARIANTS}
      size={size}
      iconSide={iconSide}
      iconShape="arrow"
    />
  ),
  parameters: { pseudo: pseudoForRows(CONTAINED_VARIANTS) },
};

export const TextStates: GridStory = {
  argTypes: gridArgTypes,
  args: gridArgs,
  render: ({ size, iconSide }) => (
    <StateGrid
      variants={TEXT_VARIANTS}
      size={size}
      iconSide={iconSide}
      iconShape="caret"
    />
  ),
  parameters: { pseudo: pseudoForRows(TEXT_VARIANTS) },
};

// Icon-only matrix — a separate spec page (Shared components → Buttons,
// bottom section), not a section of ContainedStates above: it's
// transposed (variant per row, state per column) and covers a different
// state set (Enabled/Hover/Focus/Disabled, no Pressed) from the labeled
// grids, so folding it into StateGrid would mean two incompatible axis
// orders and state lists fighting over one component. Only the five
// Contained colors, matching the spec image — Success isn't shown there,
// so it isn't invented here either.
const ICON_ONLY_VARIANTS = [
  'primary',
  'secondary',
  'tertiary',
  'danger',
  'warning',
] as const;

const ICON_ONLY_STATES = ['enabled', 'hovered', 'focused', 'disabled'] as const;
type IconOnlyState = (typeof ICON_ONLY_STATES)[number];

const ICON_ONLY_STATE_LABELS: Record<IconOnlyState, string> = {
  enabled: 'Unabled',
  hovered: 'Hover',
  focused: 'Focus',
  disabled: 'Disabled',
};

const iconOnlyId = (state: IconOnlyState, variant: string) =>
  `icon-only-btn-${state}-${variant}`;

const IconOnlyGrid = ({ size }: { size: Size }) => (
  // Not a data table — a Storybook-only state/variant reference grid, so
  // @/table/Table (paginated, sortable, backed by useTable) doesn't apply.
  // eslint-disable-next-line waldur-custom/no-hand-rolled-table
  <table className="border-collapse">
    <thead>
      <tr>
        <th className="w-28" />
        {ICON_ONLY_STATES.map((state) => (
          <th
            key={state}
            className="px-3 pb-3 text-left text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]"
          >
            {ICON_ONLY_STATE_LABELS[state]}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {ICON_ONLY_VARIANTS.map((variant) => (
        <tr key={variant}>
          <th className="whitespace-nowrap px-2 py-2 text-right align-middle text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]">
            {VARIANT_LABELS[variant] ?? variant}
          </th>
          {ICON_ONLY_STATES.map((state) => (
            <td key={state} className="p-2">
              <BaseButton
                id={iconOnlyId(state, variant)}
                variant={
                  variant as ComponentProps<typeof BaseButton>['variant']
                }
                size={size}
                iconNode={<PlusIcon weight="bold" />}
                tooltip="Add"
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

// Every id from one state's column, across every variant row — mirrors
// pseudoForRows above but keyed by column (state) instead of row, since
// this grid's axes are transposed relative to StateGrid's.
const pseudoForIconOnlyColumns = () => ({
  hover: ICON_ONLY_VARIANTS.map(
    (variant) => `#${iconOnlyId('hovered', variant)}`,
  ),
  focusVisible: ICON_ONLY_VARIANTS.map(
    (variant) => `#${iconOnlyId('focused', variant)}`,
  ),
});

export const IconOnlyStates: StoryObj<{ size: Size }> = {
  argTypes: { size: { control: 'radio', options: ['sm', 'lg'] } },
  args: { size: 'sm' },
  render: ({ size }) => <IconOnlyGrid size={size} />,
  parameters: { pseudo: pseudoForIconOnlyColumns() },
};
