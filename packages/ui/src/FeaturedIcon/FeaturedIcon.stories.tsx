import {
  CheckCircleIcon,
  InfoIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
  WarningOctagonIcon,
  WrenchIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactNode } from 'react';

import {
  FeaturedIcon,
  type FeaturedIconSize,
  type FeaturedIconTone,
  type FeaturedIconVariant,
} from './FeaturedIcon';

const DISPLAY_VARIANTS: FeaturedIconVariant[] = [
  'primary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

const TONES: FeaturedIconTone[] = ['outline', 'solid'];
const SIZES: FeaturedIconSize[] = ['sm', 'md', 'lg', 'xl'];

const VARIANT_ICONS: Record<FeaturedIconVariant, ReactNode> = {
  primary: <ShieldCheckIcon weight="bold" />,
  success: <CheckCircleIcon weight="bold" />,
  warning: <WarningCircleIcon weight="bold" />,
  danger: <WarningOctagonIcon weight="bold" />,
  info: <InfoIcon weight="bold" />,
  neutral: <WrenchIcon weight="bold" />,
};

const SIZE_LABELS: Record<
  FeaturedIconSize,
  { outlinePx: number; solidPx: number }
> = {
  sm: { outlinePx: 34, solidPx: 32 },
  md: { outlinePx: 38, solidPx: 40 },
  lg: { outlinePx: 42, solidPx: 48 },
  xl: { outlinePx: 46, solidPx: 56 },
};

const meta: Meta<typeof FeaturedIcon> = {
  title: 'Data Display/FeaturedIcon',
  component: FeaturedIcon,
  argTypes: {
    icon: { control: false },
    variant: {
      control: 'select',
      options: DISPLAY_VARIANTS,
      description: 'Semantic color theme',
    },
    tone: {
      control: 'inline-radio',
      options: TONES,
      description:
        'Visual treatment: two-ring outline or flat light-fill solid',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size scale',
    },
  },
  args: {
    icon: <ShieldCheckIcon weight="bold" />,
    variant: 'primary',
    tone: 'outline',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Tailwind/design-token rebuild of FeaturedIcon. Supports 6 core semantic variants across 2 visual tones (outline, solid) and 4 sizes (sm, md, lg, xl). The icon glyph is sized via CSS variables and colored via currentColor to preserve design-token theming across light and dark modes.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof FeaturedIcon>;

export const Playground: Story = {};

/**
 * Complete, consolidated matrix across all dimensions: Variant × Tone × Size.
 * Demonstrates all 48 permutations in a scannable, side-by-side comparison grid.
 */
export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-10 p-2">
      {TONES.map((tone) => (
        <section key={tone} className="flex flex-col gap-4">
          <div className="flex items-baseline gap-2 border-b border-[var(--surface-border)] pb-2">
            <h3 className="text-base font-semibold capitalize text-[var(--surface-text)]">
              Tone: {tone}
            </h3>
            <span className="text-xs text-[var(--surface-text-muted)]">
              {tone === 'outline'
                ? 'Two-ring transparent badge with subtle outer ring border'
                : 'Single flat light tint background fill'}
            </span>
          </div>

          <div className="flex flex-col gap-1 overflow-x-auto">
            {/* Header row */}
            <div className="grid grid-cols-[120px_repeat(4,1fr)] items-center border-b border-[var(--surface-border)] pb-2.5 text-xs font-mono uppercase text-[var(--surface-text-muted)]">
              <div className="font-medium">Variant</div>
              {SIZES.map((size) => (
                <div
                  key={size}
                  className="flex flex-col items-center gap-0.5 font-medium text-center"
                >
                  <span>{size}</span>
                  <span className="text-[10px] lowercase font-normal opacity-70">
                    {tone === 'outline'
                      ? `${SIZE_LABELS[size].outlinePx}px`
                      : `${SIZE_LABELS[size].solidPx}px`}
                  </span>
                </div>
              ))}
            </div>

            {/* Variant rows */}
            <div className="divide-y divide-[var(--surface-border)]">
              {DISPLAY_VARIANTS.map((variant) => (
                <div
                  key={variant}
                  className="grid grid-cols-[120px_repeat(4,1fr)] items-center py-3"
                >
                  <div className="font-mono text-xs font-semibold text-[var(--surface-text)]">
                    {variant}
                  </div>
                  {SIZES.map((size) => (
                    <div
                      key={size}
                      className="flex justify-center items-center"
                    >
                      <FeaturedIcon
                        icon={VARIANT_ICONS[variant]}
                        variant={variant}
                        tone={tone}
                        size={size}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  ),
};

/**
 * Direct side-by-side comparison between Outline and Solid tones for each variant.
 */
export const ToneComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-2">
      <div className="grid grid-cols-3 gap-4 pb-2 border-b border-[var(--surface-border)] text-xs font-mono uppercase text-[var(--surface-text-muted)]">
        <div>Variant</div>
        <div>Outline (Default)</div>
        <div>Solid</div>
      </div>
      {DISPLAY_VARIANTS.map((variant) => (
        <div key={variant} className="grid grid-cols-3 items-center gap-4 py-1">
          <span className="font-mono text-xs font-semibold text-[var(--surface-text)]">
            {variant}
          </span>
          <div>
            <FeaturedIcon
              icon={VARIANT_ICONS[variant]}
              variant={variant}
              tone="outline"
              size="lg"
            />
          </div>
          <div>
            <FeaturedIcon
              icon={VARIANT_ICONS[variant]}
              variant={variant}
              tone="solid"
              size="lg"
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Sizing progression from sm to xl showing visual hierarchy and proportion.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-2">
      <div>
        <h4 className="text-xs font-mono uppercase text-[var(--surface-text-muted)] mb-3">
          Outline Tone Sizes
        </h4>
        <div className="flex items-end gap-6">
          {SIZES.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <FeaturedIcon
                icon={<WarningCircleIcon weight="bold" />}
                variant="warning"
                tone="outline"
                size={size}
              />
              <div className="flex flex-col items-center text-xs text-[var(--surface-text-muted)]">
                <span className="font-semibold">{size}</span>
                <span className="text-[10px]">
                  {SIZE_LABELS[size].outlinePx}px
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-mono uppercase text-[var(--surface-text-muted)] mb-3">
          Solid Tone Sizes
        </h4>
        <div className="flex items-end gap-6">
          {SIZES.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <FeaturedIcon
                icon={<WarningCircleIcon weight="bold" />}
                variant="warning"
                tone="solid"
                size={size}
              />
              <div className="flex flex-col items-center text-xs text-[var(--surface-text-muted)]">
                <span className="font-semibold">{size}</span>
                <span className="text-[10px]">
                  {SIZE_LABELS[size].solidPx}px
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
