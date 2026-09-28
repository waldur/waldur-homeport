import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  CaretLeftIcon,
  CaretRightIcon,
  FileTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, ReactNode } from 'react';

import { BaseButton, type ButtonSize } from './BaseButton';

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
  title: 'Actions/BaseButton',
  component: BaseButton,
  parameters: {
    docs: {
      description: {
        component:
          'BaseButton component with full variant, size, and interaction state matrix.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [...CONTAINED_VARIANTS, ...TEXT_VARIANTS],
    },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
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
export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'One button, every prop exposed as a Control — reach for this when checking a single variant/size/state combination rather than scanning a full matrix.',
      },
    },
  },
};

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
  size: ButtonSize;
  iconSide: IconSide;
  iconShape: 'arrow' | 'caret';
}) => (
  // p-12 matches this package's other stories (DropdownMenu.stories.tsx,
  // Popover.stories.tsx) — Storybook's canvas has no built-in page
  // padding, so a table rendered without its own wrapper sits flush
  // against the top-left corner instead of reading as a page.
  <div className="inline-block p-12">
    {/* Not a data table — a Storybook-only state/variant reference grid,
        so @/table/Table (paginated, sortable, backed by useTable) doesn't
        apply. */}
    {/* eslint-disable-next-line waldur-custom/no-hand-rolled-table */}
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
            <th className="whitespace-nowrap px-2 py-3 text-right align-middle text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]">
              {STATE_LABELS[state]}
            </th>
            {variants.map((variant) => (
              <td key={variant} className="p-3 text-center align-middle">
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
  </div>
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
  size: ButtonSize;
  iconSide: IconSide;
}
type GridStory = StoryObj<GridArgs>;

const gridArgTypes: Meta<GridArgs>['argTypes'] = {
  size: { control: 'radio', options: ['sm', 'md', 'lg'] },
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
  parameters: {
    pseudo: pseudoForRows(CONTAINED_VARIANTS),
    docs: {
      description: {
        story:
          'Every solid-background variant (Primary through Success) across every interaction state — hover/focus/press are forced via storybook-addon-pseudo-states, not screenshots, so they reflect this build’s actual CSS. Secondary buttons feature signature two-tone styling: dark plum text paired with a vibrant magenta icon in light mode.',
      },
    },
  },
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
  parameters: {
    pseudo: pseudoForRows(TEXT_VARIANTS),
    docs: {
      description: {
        story:
          'The five transparent-background "text-*" variants (link-style buttons with no border) across every interaction state — used for lower-emphasis actions like inline row actions or a dialog’s secondary link.',
      },
    },
  },
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

const IconOnlyGrid = ({ size }: { size: ButtonSize }) => (
  // p-12 matches this package's other stories (DropdownMenu.stories.tsx,
  // Popover.stories.tsx) — see StateGrid's own comment above.
  <div className="inline-block p-12">
    {/* Not a data table — a Storybook-only state/variant reference grid,
        so @/table/Table (paginated, sortable, backed by useTable) doesn't
        apply. */}
    {/* eslint-disable-next-line waldur-custom/no-hand-rolled-table */}
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
            <th className="whitespace-nowrap px-2 py-3 text-right align-middle text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]">
              {VARIANT_LABELS[variant] ?? variant}
            </th>
            {ICON_ONLY_STATES.map((state) => (
              <td key={state} className="p-3 text-center align-middle">
                <BaseButton
                  id={iconOnlyId(state, variant)}
                  variant={
                    variant as ComponentProps<typeof BaseButton>['variant']
                  }
                  size={size}
                  iconNode={<PlusCircleIcon weight="bold" />}
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
  </div>
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

export const IconOnlyStates: StoryObj<{ size: ButtonSize }> = {
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
  // lg, not sm: real icon-only usage (TableColumnsButton's gear,
  // TableFilterButton's funnel — see the app's own toolbar) renders at
  // this size. sm's tighter padding reads as a small circle rather than
  // the bordered square those buttons actually are.
  args: { size: 'lg' },
  render: ({ size }) => <IconOnlyGrid size={size} />,
  parameters: {
    pseudo: pseudoForIconOnlyColumns(),
    docs: {
      description: {
        story:
          'Icon-only buttons (no label) across the five Contained colors and four states — note the square, fixed-size hit target (28/36/44px per size) instead of the label buttons’ content-driven width, and the disabledReason-driven tooltip explaining why a disabled one is unavailable.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Sizes — the grids above expose `size` as a Controls radio (defaulting to
// lg), so comparing sm/md/lg means re-rendering the same grid three times
// and holding the differences in your head. This story instead puts all
// three side by side as their own axis, across the three shapes size
// actually changes: a plain label, a label+icon, and icon-only (whose
// square hit target — 28/36/44px, from the cva `size` variant's own
// comment — is the one case size changes something other than padding).
// Kept to a single representative variant (primary) since size's visual
// effect (padding/leading/icon scale) doesn't vary by color — that's
// already covered by ContainedStates/TextStates above.
const SIZES = ['sm', 'md', 'lg'] as const;
const SIZE_HEIGHTS: Record<ButtonSize, string> = {
  sm: '28px',
  md: '36px',
  lg: '44px',
};

const SizeGrid = () => (
  <div className="inline-block p-12">
    {/* eslint-disable-next-line waldur-custom/no-hand-rolled-table */}
    <table className="border-collapse">
      <thead>
        <tr>
          <th className="w-32" />
          {SIZES.map((size) => (
            <th
              key={size}
              className="px-3 pb-3 text-left text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]"
            >
              {size} ({SIZE_HEIGHTS[size]})
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th className="whitespace-nowrap px-2 py-3 text-right align-middle text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]">
            Label
          </th>
          {SIZES.map((size) => (
            <td key={size} className="p-3 align-middle">
              <BaseButton variant="primary" size={size} label="Label" />
            </td>
          ))}
        </tr>
        <tr>
          <th className="whitespace-nowrap px-2 py-3 text-right align-middle text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]">
            Label + icon
          </th>
          {SIZES.map((size) => (
            <td key={size} className="p-3 align-middle">
              <BaseButton
                variant="primary"
                size={size}
                label="Label"
                iconNode={<PlusCircleIcon weight="bold" />}
              />
            </td>
          ))}
        </tr>
        <tr>
          <th className="whitespace-nowrap px-2 py-3 text-right align-middle text-sm font-medium text-[var(--surface-text-secondary,#6b7280)]">
            Icon only
          </th>
          {SIZES.map((size) => (
            <td key={size} className="p-3 align-middle">
              <BaseButton
                variant="primary"
                size={size}
                iconNode={<PlusCircleIcon weight="bold" />}
                tooltip="Add"
              />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
);

export const Sizes: Story = {
  render: () => <SizeGrid />,
  parameters: {
    docs: {
      description: {
        story:
          'sm/md/lg side by side across the three shapes size affects — a plain label, a label with an icon, and icon-only (whose hit target goes square and fixed-width instead of content-driven) — one variant (primary) since color doesn’t interact with size.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Realistic usage — the matrices above isolate one axis (variant × state) at
// a time; this story instead shows the handful of button *groups* that
// recur throughout the app, each rendered as it actually gets composed, so a
// reader can sanity-check spacing/alignment/emphasis choices in context
// rather than mentally assembling swatches. One story, not four, so the
// sidebar doesn't grow a story per layout — the <SectionHeader>s below do
// that job inside the canvas instead.
const SectionHeader = ({ title, hint }: { title: string; hint: string }) => (
  <div className="mb-3">
    <h3 className="text-sm font-semibold text-[var(--surface-text-primary,#111827)]">
      {title}
    </h3>
    <p className="text-sm text-[var(--surface-text-secondary,#6b7280)]">
      {hint}
    </p>
  </div>
);

const UsageSection = ({ children }: { children: ReactNode }) => (
  <div className="mb-10">{children}</div>
);

export const RealisticUsage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The recurring button groupings from the app itself (dialog footer, wizard footer, table toolbar, inline row actions) rendered together, instead of one variant at a time — for eyeballing real composition, not just individual buttons.',
      },
    },
  },
  render: () => (
    <div className="p-12" style={{ maxWidth: 640 }}>
      <UsageSection>
        <SectionHeader
          title="Dialog footer"
          hint="CloseDialogButton (tertiary) + a primary submit — the standard modal footer pairing."
        />
        <div className="flex justify-end gap-3 border-t border-[var(--surface-border,#e5e7eb)] pt-4">
          <BaseButton variant="tertiary" size="lg" label="Cancel" />
          <BaseButton variant="primary" size="lg" label="Save" />
        </div>
      </UsageSection>

      <UsageSection>
        <SectionHeader
          title="Destructive confirmation footer"
          hint="Same layout, danger replacing primary — the delete-confirmation shape."
        />
        <div className="flex justify-end gap-3 border-t border-[var(--surface-border,#e5e7eb)] pt-4">
          <BaseButton variant="tertiary" size="lg" label="Cancel" />
          <BaseButton variant="danger" size="lg" label="Delete" />
        </div>
      </UsageSection>

      <UsageSection>
        <SectionHeader
          title="Wizard footer"
          hint="Back (icon-left, tertiary) on the far side, Continue (icon-right, primary) advancing — matches WizardModal's default footer."
        />
        <div className="flex items-center justify-between border-t border-[var(--surface-border,#e5e7eb)] pt-4">
          <BaseButton
            variant="tertiary"
            size="lg"
            label="Back"
            iconNode={<CaretLeftIcon weight="bold" />}
          />
          <BaseButton
            variant="primary"
            size="lg"
            label="Continue"
            iconNode={<CaretRightIcon weight="bold" />}
            iconRight
          />
        </div>
      </UsageSection>

      <UsageSection>
        <SectionHeader
          title="Table toolbar"
          hint="Icon-only utility buttons (search, filter) beside a labeled primary action — a table's action bar."
        />
        <div className="flex items-center gap-2 border-t border-[var(--surface-border,#e5e7eb)] pt-4">
          <BaseButton
            variant="tertiary"
            size="lg"
            iconNode={<MagnifyingGlassIcon weight="bold" />}
            tooltip="Search"
          />
          <BaseButton
            variant="tertiary"
            size="lg"
            iconNode={<FunnelIcon weight="bold" />}
            tooltip="Filter"
          />
          <div className="flex-1" />
          <BaseButton
            variant="primary"
            size="lg"
            label="New"
            iconNode={<PlusIcon weight="bold" />}
          />
        </div>
      </UsageSection>

      <UsageSection>
        <SectionHeader
          title="Inline row actions"
          hint="Low-emphasis text-* variants for actions attached to a single list row — never the full-weight Contained colors here."
        />
        <div className="flex items-center justify-between rounded-md border border-[var(--surface-border,#e5e7eb)] px-4 py-3">
          <span className="text-sm">acc-prod-eu-west-1</span>
          <div className="flex gap-1">
            <BaseButton
              variant="text-secondary"
              size="sm"
              label="Edit"
              iconNode={<PencilIcon weight="bold" />}
            />
            <BaseButton
              variant="text-danger"
              size="sm"
              label="Delete"
              iconNode={<TrashIcon weight="bold" />}
            />
          </div>
        </div>
      </UsageSection>

      <UsageSection>
        <SectionHeader
          title="Page header actions (Two-tone secondary)"
          hint="Secondary buttons feature two-tone brand styling: dark plum text paired with a vibrant magenta icon for signature brand actions."
        />
        <div className="flex items-center gap-3 border-t border-[var(--surface-border,#e5e7eb)] pt-4">
          <BaseButton
            variant="secondary"
            size="md"
            label="Sync"
            iconNode={<ArrowsClockwiseIcon weight="bold" />}
          />
          <BaseButton
            variant="secondary"
            size="md"
            label="Show log"
            iconNode={<FileTextIcon weight="bold" />}
          />
        </div>
      </UsageSection>
    </div>
  ),
};
