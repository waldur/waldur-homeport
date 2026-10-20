import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { BadgeTone, BadgeVariant } from 'waldur-ui';

import { StateIndicator } from './StateIndicator';

const VARIANTS: BadgeVariant[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

const TONES: BadgeTone[] = ['outline'];

const meta: Meta<typeof StateIndicator> = {
  title: 'Data Display/StateIndicator',
  component: StateIndicator,
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    tone: { control: 'select', options: TONES },
    active: { control: 'boolean' },
    hasBullet: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'lg'] },
  },
  args: {
    label: 'Creating',
    variant: 'primary',
    tone: 'outline',
    active: true,
  },
  parameters: {
    docs: {
      description: {
        component:
          "A resource or order state as a Badge. `active` adds a spinner for an in-progress state, in the badge's own text colour (brand for `primary` and `secondary`). Backend labels in all caps are title-cased (`ACTIVE` → `Active`); short acronyms (`OK`) stay as they are.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof StateIndicator>;

// What a CSS colour expression resolves to on this page.
const resolve = (canvasElement: HTMLElement, colour: string) => {
  const probe = document.createElement('span');
  probe.style.color = colour;
  canvasElement.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
};

export const Playground: Story = {};

/** Every variant and tone with `active`: each spinner matches its badge's text. */
export const ActiveSpinners: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {TONES.map((tone) => (
        <div key={tone} className="flex flex-wrap items-center gap-2">
          <span className="w-[64px] text-sm text-quaternary">{tone}</span>
          {VARIANTS.map((variant) => (
            <StateIndicator
              key={variant}
              label={variant}
              variant={variant}
              tone={tone}
              active
              data-testid={`state-${tone}-${variant}`}
            />
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const tone of TONES) {
      for (const variant of VARIANTS) {
        const badge = canvas.getByTestId(`state-${tone}-${variant}`);
        const spinner = within(badge).getByRole('status');
        await expect(
          getComputedStyle(spinner).color,
          `${tone} ${variant}`,
        ).toBe(getComputedStyle(badge).color);
      }
    }
  },
};

/**
 * Regression: the spinner used `text-${variant}`, and `text-primary` became
 * the neutral text scale's strongest step, so a primary badge's spinner
 * turned near-black. It now takes the badge's brand text colour.
 */
export const PrimarySpinnerIsBrand: Story = {
  render: () => (
    <div className="flex gap-2">
      <StateIndicator
        label="Creating"
        variant="primary"
        tone="outline"
        active
        data-testid="primary-outline"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nearBlack = resolve(canvasElement, 'var(--text-primary)');
    for (const id of ['primary-outline']) {
      const badge = canvas.getByTestId(id);
      const spinner = within(badge).getByRole('status');
      const colour = getComputedStyle(spinner).color;
      // The badge's own brand text, never the neutral text colour.
      await expect(colour, id).toBe(getComputedStyle(badge).color);
      await expect(colour, id).not.toBe(nearBlack);
    }
  },
};

export const LabelNormalization: Story = {
  render: () => (
    <div className="flex gap-2">
      <StateIndicator label="ACTIVE" variant="success" tone="outline" />
      <StateIndicator label="OK" variant="success" tone="outline" />
      <StateIndicator label="Erred" variant="danger" tone="outline" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Active')).toBeVisible();
    await expect(canvas.getByText('OK')).toBeVisible();
    await expect(canvas.getByText('Erred')).toBeVisible();
  },
};
