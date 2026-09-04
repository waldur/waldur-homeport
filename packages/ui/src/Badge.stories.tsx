import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge, BadgeTone, BadgeVariant } from './Badge';

const VARIANTS: BadgeVariant[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
  'purple',
  'blue',
  'indigo',
  'moss',
  'pink',
];

const TONES: BadgeTone[] = ['outline', 'light', 'solid'];

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    tone: { control: 'select', options: TONES },
    size: { control: 'select', options: ['sm', 'lg'] },
    pill: { control: 'boolean' },
    roundless: { control: 'boolean' },
  },
  args: {
    children: 'Badge',
    variant: 'primary',
    tone: 'outline',
    pill: false,
    roundless: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Waldur design-system Badge supporting 12 variants and 3 tones (outline, light, solid), with pill and square styling. Verified against Metronic styling parity.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

/**
 * Full variant × tone matrix. Outline is the default shape for 89% of call sites.
 */
export const VariantToneMatrix: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)] space-y-6">
      {TONES.map((tone) => (
        <div key={tone}>
          <h4 className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-3">
            Tone: {tone}
          </h4>
          <div className="flex flex-wrap gap-2">
            {VARIANTS.map((variant) => (
              <Badge key={variant} variant={variant} tone={tone}>
                {variant}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Shape variants: standard rounded (8px), pill (full-rounded), and roundless (square).
 */
export const Shapes: Story = {
  render: () => (
    <div className="flex gap-4 p-6 items-center">
      <Badge variant="primary" tone="outline">
        Standard (8px)
      </Badge>
      <Badge variant="primary" tone="outline" pill>
        Pill Shape
      </Badge>
      <Badge variant="primary" tone="outline" roundless>
        Roundless
      </Badge>
    </div>
  ),
};

/**
 * Sizes: Small, Default, and Large.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 p-6 items-center">
      <Badge variant="success" size="sm" tone="light">
        Small
      </Badge>
      <Badge variant="success" tone="light">
        Default
      </Badge>
      <Badge variant="success" size="lg" tone="light">
        Large
      </Badge>
    </div>
  ),
};
