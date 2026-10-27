import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { NativeSelect } from './NativeSelect';
import { StateGrid } from './storyHelpers';

const meta: Meta<typeof NativeSelect> = {
  title: 'Forms/Selection/Native select',
  component: NativeSelect,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    solid: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fit: { control: 'boolean' },
  },
  args: {
    size: 'md',
    solid: false,
    invalid: false,
    disabled: false,
    fit: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          "The browser's own `<select>` (its popup, keyboard and mobile picker) drawn like an `Input`, with a caret icon in place of the native arrow. Pass `<option>` / `<optgroup>` children. `fit` shrinks it to its widest option; `containerClassName` places the field in its row, `className` styles the select. For a searchable or multi-value list use `Select`.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof NativeSelect>;

const options = (
  <>
    <option value="tcp">TCP</option>
    <option value="udp">UDP</option>
    <option value="icmp">ICMP</option>
  </>
);

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-[420px] p-5">
      <NativeSelect aria-label="Protocol" {...args}>
        {options}
      </NativeSelect>
    </div>
  ),
};

const STATES = [
  ['Default', {}],
  ['Invalid', { invalid: true }],
  ['Disabled', { disabled: true }],
] as const;

export const States: Story = {
  render: () => (
    <StateGrid
      rows={STATES.map(([label, props]) => [
        label,
        (solid) => (
          <NativeSelect
            aria-label={solid ? `${label} solid` : label}
            solid={solid}
            {...props}
          >
            {options}
          </NativeSelect>
        ),
      ])}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-[420px] flex-col gap-3 p-5">
      <NativeSelect aria-label="Small" size="sm">
        {options}
      </NativeSelect>
      <NativeSelect aria-label="Medium">{options}</NativeSelect>
      <NativeSelect aria-label="Large" size="lg">
        {options}
      </NativeSelect>
      <NativeSelect aria-label="Fit" fit>
        {options}
      </NativeSelect>
    </div>
  ),
};

const MONTHS = (
  <>
    <option value="all">All time</option>
    <option value="2026-09">September 2026</option>
    <option value="2026-10">October 2026</option>
  </>
);

/** A labelled cell: the dashed box is the space the select is placed in. */
const Case = ({
  title,
  note,
  children,
  className = '',
}: {
  title: string;
  note: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className="flex flex-col gap-1">
    <h4 className="m-0 text-sm font-semibold text-primary">{title}</h4>
    <p className="m-0 text-sm text-tertiary">{note}</p>
    <div
      data-testid={title}
      className={`w-[480px] rounded-lg border-[1px] border-dashed border-secondary p-2.5 ${className}`}
    >
      {children}
    </div>
  </section>
);

/**
 * `fit` is for a select that sits beside other controls, such as the month
 * and resource pickers in a report toolbar. Without it a select fills the
 * space it is given; with it the select is as wide as its widest option, in
 * a row and also in a column that would otherwise stretch it. The caret
 * moves with the select either way.
 */
export const FitVersusFill: Story = {
  name: 'Fit versus fill',
  render: () => (
    <div className="flex flex-col gap-5 p-5">
      <Case title="Default, in a block" note="Fills the width it is given.">
        <NativeSelect aria-label="Default in block">{MONTHS}</NativeSelect>
      </Case>
      <Case
        title="fit, in a block"
        note="As wide as 'September 2026', the longest option."
      >
        <NativeSelect aria-label="Fit in block" fit>
          {MONTHS}
        </NativeSelect>
      </Case>
      <Case
        title="Default, in a toolbar row"
        note="Takes all the room left in the row, so the next control is pushed to the edge."
        className="flex items-center gap-2.5"
      >
        <NativeSelect aria-label="Default in row">{MONTHS}</NativeSelect>
        <span className="shrink-0 text-sm text-tertiary">Export</span>
      </Case>
      <Case
        title="fit, in a toolbar row"
        note="Takes only the room it needs; the next control follows it."
        className="flex items-center gap-2.5"
      >
        <NativeSelect aria-label="Fit in row" fit>
          {MONTHS}
        </NativeSelect>
        <span className="shrink-0 text-sm text-tertiary">Export</span>
      </Case>
      <Case
        title="fit, in a column"
        note="A column stretches its children; fit keeps the select at its own width and the caret attached."
        className="flex flex-col gap-1.5"
      >
        <NativeSelect aria-label="Fit in column" fit>
          {MONTHS}
        </NativeSelect>
      </Case>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const width = (el: HTMLElement) => el.getBoundingClientRect().width;
    const box = (title: string) => canvas.getByTestId(title);
    const select = (name: string) => canvas.getByLabelText(name);

    // Fills its box: the box less its padding and border either side. Read
    // from the box rather than assumed: the padding is in rem, and the root
    // font-size is 13px or 16px depending on which stylesheet the run loaded.
    const frame = box('Default, in a block');
    const style = getComputedStyle(frame);
    const inner =
      width(frame) -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight) -
      parseFloat(style.borderLeftWidth) -
      parseFloat(style.borderRightWidth);
    await expect(Math.round(width(select('Default in block')))).toBe(
      Math.round(inner),
    );
    // Fit is clearly narrower, in a block, a row and a column alike.
    for (const name of ['Fit in block', 'Fit in row', 'Fit in column']) {
      await expect(width(select(name))).toBeLessThan(inner * 0.6);
    }
    // In a row the default select takes all the room the next control leaves.
    await expect(width(select('Default in row'))).toBeGreaterThan(
      width(select('Fit in row')) * 1.5,
    );
    // The caret stays attached: it sits 12px inside the select's right edge.
    for (const name of ['Fit in block', 'Fit in row', 'Fit in column']) {
      const el = select(name);
      const caret = el.parentElement!.querySelector('svg')!;
      await expect(
        Math.round(
          el.getBoundingClientRect().right -
            caret.getBoundingClientRect().right,
        ),
      ).toBe(12);
    }
  },
};
