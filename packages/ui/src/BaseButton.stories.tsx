import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, ReactNode } from 'react';

import { BaseButton } from './BaseButton';

type Size = 'sm' | 'lg';
type IconSide = 'left' | 'right';

// Two column-*groups* sharing one set of state rows — matches the design
// spec's actual layout (Shared components → Buttons): "Contained" and
// "Text" sit side by side under one Enabled/Hovered/.../Disabled row axis,
// not as two separate tables. `iconShape` follows the spec too: Contained
// uses the arrow glyph, Text the caret — a real (if secondary) visual
// distinction between the two styles, not an arbitrary choice.
const GROUPS = [
  {
    label: 'Contained',
    variants: [
      'primary',
      'secondary',
      'tertiary',
      'danger',
      'warning',
      'success',
    ] as const,
    iconShape: 'arrow' as const,
  },
  {
    label: 'Text',
    variants: [
      'text-primary',
      'text-secondary',
      'text-danger',
      'text-warning',
      'text-success',
    ] as const,
    iconShape: 'caret' as const,
  },
];
const ALL_VARIANTS = GROUPS.flatMap((group) => group.variants);

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
      options: ALL_VARIANTS,
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

// The states story takes `size`/`iconSide` args instead of BaseButton's own
// props (`iconSide` has no such prop at all — it's this story's friendlier
// stand-in for `iconRight`), so it gets its own StoryObj shape rather than
// reusing `Story` (= StoryObj<typeof BaseButton>) above.
interface GridArgs {
  size: Size;
  iconSide: IconSide;
}
type GridStory = StoryObj<GridArgs>;

/**
 * State × variant reference page, laid out to match the design spec
 * (Shared components → Buttons) as closely as the real component allows:
 * "Contained" and "Text" as two column-groups sharing one row axis
 * (Enabled/Hovered/Focused/Pressed/Disabled), a page header mirroring the
 * spec's own title/description block, and real pseudo-classes rather than
 * screenshots — storybook-addon-pseudo-states rewrites the stylesheet so
 * `:hover`/`:focus-visible`/`:active` can be forced onto one row's ids at
 * a time while every other row stays in its own natural state (its
 * "Targeting specific elements" docs: a selector array on
 * `parameters.pseudo`, keyed by id).
 *
 * Two deliberate departures from the spec image, both because the real
 * BaseButton can't draw what it shows:
 * - One icon, not a mirrored pair on each side of the label — BaseButton
 *   takes a single `iconNode` + `iconRight` side toggle. Faking two icons
 *   here would show something no real BaseButton call can produce.
 * - Size and icon side are Controls args, not extra grid axes — doubling
 *   every row for left+right, and again for sm+lg, would quadruple the
 *   grid into something worse to scan than the two toggles below it.
 */
const StatesPage = ({ size, iconSide }: GridArgs) => (
  <div className="max-w-fit">
    <div className="mb-10 rounded-xl bg-[#f7f8fa] px-10 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]">
        <span
          className="inline-flex size-5 items-center justify-center rounded"
          style={{ background: 'var(--btn-primary-bg)' }}
        >
          <span className="block size-2 rounded-sm bg-white" />
        </span>
        Shared components
        <span aria-hidden="true">→</span>
        Buttons
      </div>
      <h1 className="mb-2 text-4xl font-bold text-[var(--surface-text-primary,#111827)]">
        Buttons
      </h1>
      <p className="text-base text-[var(--surface-text-secondary,#6b7280)]">
        Buttons communicate actions that users can take.
      </p>
    </div>

    {/* Not a data table — a Storybook-only state/variant reference grid, so
        @/table/Table (paginated, sortable, backed by useTable) doesn't
        apply. */}
    {/* eslint-disable-next-line waldur-custom/no-hand-rolled-table */}
    <table className="border-collapse">
      <thead>
        <tr>
          <th className="w-28" />
          {GROUPS.map((group) => (
            <th
              key={group.label}
              colSpan={group.variants.length}
              className="px-3 pb-3 text-left align-bottom"
            >
              <span
                className="inline-block border-b-2 pb-1 text-xl font-bold text-[var(--surface-text-primary,#111827)]"
                style={{ borderColor: 'var(--btn-primary-bg)' }}
              >
                {group.label}
              </span>
            </th>
          ))}
        </tr>
        <tr>
          <th className="w-28" />
          {GROUPS.map((group) =>
            group.variants.map((variant, index) => (
              <th
                key={variant}
                className={`px-3 pb-3 text-left text-sm font-medium text-[var(--surface-text-secondary,#6b7280)] ${
                  index === 0 ? 'border-l border-transparent pl-4' : ''
                }`}
              >
                {VARIANT_LABELS[variant] ?? variant}
              </th>
            )),
          )}
        </tr>
      </thead>
      <tbody>
        {STATES.map((state) => (
          <tr key={state}>
            <th className="whitespace-nowrap px-2 py-2 text-right align-middle text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]">
              {STATE_LABELS[state]}
            </th>
            {GROUPS.map((group) =>
              group.variants.map((variant, index) => (
                <td
                  key={variant}
                  className={`p-2 ${index === 0 ? 'pl-4' : ''}`}
                >
                  <BaseButton
                    id={stateId(state, variant)}
                    variant={
                      variant as ComponentProps<typeof BaseButton>['variant']
                    }
                    size={size}
                    label="Label"
                    iconNode={ICONS[iconSide][group.iconShape]}
                    iconRight={iconSide === 'right'}
                    disabled={state === 'disabled'}
                    disabledReason={
                      state === 'disabled'
                        ? 'Disabled for the state matrix'
                        : undefined
                    }
                  />
                </td>
              )),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Every id from one state's row, across every variant column in both
// groups — the exact shape storybook-addon-pseudo-states' selector-array
// targeting expects.
const pseudoForRows = () => ({
  hover: ALL_VARIANTS.map((variant) => `#${stateId('hovered', variant)}`),
  focusVisible: ALL_VARIANTS.map(
    (variant) => `#${stateId('focused', variant)}`,
  ),
  active: ALL_VARIANTS.map((variant) => `#${stateId('pressed', variant)}`),
});

export const States: GridStory = {
  argTypes: {
    size: { control: 'radio', options: ['sm', 'lg'] },
    iconSide: { control: 'radio', options: ['left', 'right'] },
  },
  args: { size: 'lg', iconSide: 'right' },
  render: (args) => <StatesPage {...args} />,
  parameters: { pseudo: pseudoForRows() },
};
