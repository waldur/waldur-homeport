import type { Meta, StoryObj } from '@storybook/react-vite';

import tokens from '../tokens/colors.json';

import { DEFAULT_PRIMARY_COLORS } from './brandColors';
import { useResolvedVar } from './react';

const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: {
    docs: {
      description: {
        component:
          "Design tokens defining Waldur's color palette. The primitive ramps are split into Neutral, Status, Accent and Brand pages that share one swatch style (step, resolved hex, variable name on hover); Surface Tokens shows the semantic layer that responds to theme and tenant branding. Ramp pages are driven by tokens/colors.json.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

// --- Primitive ramps -------------------------------------------------------
// The Neutral, Status and Accent pages are driven by tokens/colors.json, the
// same file that generates colorRamps.css, so a ramp or step added there shows
// up with no edit to this story. Brand is the runtime ramp and takes its steps
// from the default palette. Every swatch shows the value read back from the
// page, not from the JSON, so it is what the stylesheet really resolves to.

type Ramp = {
  description?: string;
  css?: boolean;
  steps: Record<string, unknown>;
};
const RAMPS = tokens.ramps as Record<string, Ramp>;

/** Ramps with a CSS variable (`primary` is SCSS-only), in the JSON's order. */
const CSS_RAMPS = Object.keys(RAMPS).filter(
  (name) => RAMPS[name].css !== false,
);

const NEUTRAL = ['gray', 'gray-dark'];
// info is a contextual state colour (Bootstrap's `info`), not a decorative hue.
const STATUS = ['success', 'warning', 'error', 'info'];
const ACCENT_ORDER = [
  'purple',
  'blue',
  'indigo',
  'teal',
  'pink',
  'rose',
  'orange',
  'moss',
];
/** Every remaining ramp, so one added to the JSON shows up on Accent. */
const ACCENT = [
  ...ACCENT_ORDER.filter((name) => name in RAMPS),
  ...CSS_RAMPS.filter(
    (name) => ![...NEUTRAL, ...STATUS, ...ACCENT_ORDER].includes(name),
  ),
];

/** One swatch row: `--<prefix>-<step>` for each step. */
type RampSpec = {
  title: string;
  prefix: string;
  steps: string[];
  description?: string;
};

const RAMP_TITLES: Record<string, string> = {
  'gray-dark': 'Gray (dark theme)',
  error: 'Error / Danger',
};
const tokenRamp = (name: string): RampSpec => ({
  title: RAMP_TITLES[name] ?? name.charAt(0).toUpperCase() + name.slice(1),
  prefix: `--color-${name}`,
  steps: Object.keys(RAMPS[name].steps),
  description: RAMPS[name].description,
});

/** Renders `backticked` spans as inline code. */
function Prose({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 ? (
          <code
            key={i}
            className="rounded bg-[var(--surface-hover-bg)] px-1 font-mono text-[11px]"
          >
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Black or white, whichever has the higher WCAG contrast on `hex`. */
function readableOn(hex: string) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) {
    return 'inherit';
  }
  const [r, g, b] = m.slice(1).map((h) => channel(parseInt(h, 16)));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // contrast vs white = 1.05 / (L + 0.05), vs black = (L + 0.05) / 0.05
  return 1.05 / (luminance + 0.05) > (luminance + 0.05) / 0.05
    ? '#fff'
    : '#000';
}

function RampTile({ cssVar, step }: { cssVar: string; step: string }) {
  const value = useResolvedVar(cssVar);
  return (
    <div
      title={cssVar}
      className="overflow-hidden rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)]"
    >
      <div
        className="flex h-14 items-end px-2 pb-1.5 font-mono text-xs font-semibold"
        style={{
          backgroundColor: `var(${cssVar})`,
          color: readableOn(value),
        }}
      >
        {step}
      </div>
      <div className="px-2 py-1 font-mono text-[10px] uppercase text-[var(--surface-text-secondary)]">
        {value || '\u00a0'}
      </div>
    </div>
  );
}

function RampSection({ title, prefix, steps, description }: RampSpec) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
        <h4 className="text-sm font-semibold text-[var(--surface-text-primary)]">
          {title}
        </h4>
        <code className="text-[10px] text-[var(--surface-text-muted)]">
          {prefix}-N
        </code>
      </div>
      {description && (
        <p className="mb-2 max-w-3xl text-xs text-[var(--surface-text-secondary)]">
          <Prose text={description} />
        </p>
      )}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {steps.map((step) => (
          <RampTile key={step} cssVar={`${prefix}-${step}`} step={step} />
        ))}
      </div>
    </section>
  );
}

/** Shared frame of the Neutral, Status, Accent and Brand pages. */
function RampPage({
  title,
  blurb,
  ramps,
  children,
}: {
  title: string;
  blurb: string;
  ramps: RampSpec[];
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--surface-page-bg)] p-6">
      <h3 className="mb-1 text-base font-semibold text-[var(--surface-text-primary)]">
        {title}
      </h3>
      <p className="mb-6 max-w-3xl text-xs text-[var(--surface-text-secondary)]">
        {blurb}
      </p>
      {ramps.map((ramp) => (
        <RampSection key={ramp.prefix} {...ramp} />
      ))}
      {children}
    </div>
  );
}

const PHYSICAL =
  'Ramps are physical: step 900 is dark in both themes and nothing overrides them per theme, so switching the theme does not change a swatch. The theme is chosen one level up, by the semantic tokens (see Surface Tokens).';

function ComparisonBar({ cssVar }: { cssVar: string }) {
  const value = useResolvedVar(cssVar);
  return (
    <div
      title={cssVar}
      className="flex h-9 items-center justify-end rounded-md border border-[var(--surface-card-border)] px-2 font-mono text-[10px] uppercase"
      style={{ backgroundColor: `var(${cssVar})`, color: readableOn(value) }}
    >
      {value}
    </div>
  );
}

/** Gray and gray-dark step by step: same lightness order, different colours. */
function GrayComparison() {
  const steps = Object.keys(RAMPS.gray.steps);
  return (
    <section className="mb-6">
      <h4 className="mb-2 text-sm font-semibold text-[var(--surface-text-primary)]">
        Gray vs Gray (dark theme)
      </h4>
      <p className="mb-3 max-w-3xl text-xs text-[var(--surface-text-secondary)]">
        Dark UI wants neutral grays where gray is blue-tinted (500 is #667085 vs
        #85888e), so dark surfaces (the dark-theme token blocks and the dark
        sidebar style) read gray-dark instead of gray.
      </p>
      <div className="grid max-w-xl grid-cols-[3rem_1fr_1fr] items-center gap-x-3 gap-y-1">
        <div />
        <code className="text-[10px] text-[var(--surface-text-muted)]">
          --color-gray-N
        </code>
        <code className="text-[10px] text-[var(--surface-text-muted)]">
          --color-gray-dark-N
        </code>
        {steps.map((step) => (
          <div key={step} className="contents">
            <div className="font-mono text-xs font-semibold text-[var(--surface-text-primary)]">
              {step}
            </div>
            <ComparisonBar cssVar={`--color-gray-${step}`} />
            <ComparisonBar cssVar={`--color-gray-dark-${step}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Chrome, typography, borders and backdrops. Light UI reads `gray`, dark UI
 * reads `gray-dark`. From `colorRamps.css`, generated from
 * `tokens/colors.json` (`yarn tokens:generate`).
 */
export const Neutral: Story = {
  render: () => (
    <RampPage
      title="Neutral"
      blurb={`Gray (light UI) and gray-dark (dark UI). ${PHYSICAL}`}
      ramps={NEUTRAL.map(tokenRamp)}
    >
      <GrayComparison />
    </RampPage>
  ),
};

/**
 * Contextual state colours for pills, alerts, badges and buttons. From
 * `colorRamps.css`.
 */
export const Status: Story = {
  render: () => (
    <RampPage
      title="Status"
      blurb={`Success, caution, failure and information. info is the same violet as purple on purpose. ${PHYSICAL}`}
      ramps={STATUS.map(tokenRamp)}
    />
  ),
};

/**
 * Decorative hues for badges, tags and charts. Sparser than the status ramps:
 * steps Metronic never defined are left out rather than invented. From
 * `colorRamps.css`.
 */
export const Accent: Story = {
  render: () => (
    <RampPage
      title="Accent hues"
      blurb={`Badges, tags and charts. Steps Metronic never defined (25, 100, 800 and most 400s) are left out rather than invented. ${PHYSICAL}`}
      ramps={ACCENT.map(tokenRamp)}
    />
  ),
};

/**
 * The tenant-configurable brand ramp, generated at runtime from
 * `--waldur-brand-color` by `initBrandTokens()`. Step 600 is the configured
 * colour; the other steps are generated around it. Storybook seeds Waldur's
 * default green.
 */
export const Brand: Story = {
  render: () => (
    <RampPage
      title="Brand"
      blurb="Not part of colors.json: the value is set per tenant at bootstrap and only bridged to Tailwind (bg-brand-600 reads --color-brand-600, which reads --waldur-brand-600). Like the other ramps it is physical."
      ramps={[
        {
          title: 'Brand',
          prefix: '--waldur-brand',
          steps: Object.keys(DEFAULT_PRIMARY_COLORS),
          description:
            'Derived at runtime from --waldur-brand-color; 600 is that colour.',
        },
      ]}
    />
  ),
};

/**
 * Contextual Surface and Semantic Tokens used by components across light and dark themes.
 */
export const SurfaceTokens: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)] space-y-6">
      <div>
        <h3 className="text-base font-semibold text-[var(--surface-text-primary)] mb-3">
          Surface & Layout Tokens
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] shadow-xs">
            <div className="text-sm font-semibold text-[var(--surface-text-primary)]">
              Card Surface
            </div>
            <div className="text-xs text-[var(--surface-text-secondary)] mt-1">
              Primary container background
            </div>
            <div className="mt-3 text-xs font-mono text-[var(--surface-text-muted)]">
              --surface-card-bg
            </div>
          </div>

          <div className="p-4 rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-page-bg)] shadow-xs">
            <div className="text-sm font-semibold text-[var(--surface-text-primary)]">
              Page Background
            </div>
            <div className="text-xs text-[var(--surface-text-secondary)] mt-1">
              App viewport canvas
            </div>
            <div className="mt-3 text-xs font-mono text-[var(--surface-text-muted)]">
              --surface-page-bg
            </div>
          </div>

          <div className="p-4 rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-hover-bg)] shadow-xs">
            <div className="text-sm font-semibold text-[var(--surface-text-primary)]">
              Hover Fill
            </div>
            <div className="text-xs text-[var(--surface-text-secondary)] mt-1">
              Table rows, menu item focus
            </div>
            <div className="mt-3 text-xs font-mono text-[var(--surface-text-muted)]">
              --surface-hover-bg
            </div>
          </div>

          <div className="p-4 rounded-md border border-[var(--surface-sidebar-border)] bg-[var(--surface-sidebar-bg)] shadow-xs">
            <div className="text-sm font-semibold text-[var(--surface-text-primary)]">
              Sidebar Surface
            </div>
            <div className="text-xs text-[var(--surface-text-secondary)] mt-1">
              Navigation drawer/sidebar
            </div>
            <div className="mt-3 text-xs font-mono text-[var(--surface-text-muted)]">
              --surface-sidebar-bg
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-[var(--surface-text-primary)] mb-3">
          Text Tokens
        </h3>
        <div className="p-4 rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] space-y-2">
          <div className="text-lg font-bold text-[var(--surface-text-primary)]">
            Primary Text: Headings and high-contrast labels
            (--surface-text-primary)
          </div>
          <div className="text-sm text-[var(--surface-text-secondary)]">
            Secondary Text: Body paragraphs and descriptive subtitles
            (--surface-text-secondary)
          </div>
          <div className="text-xs text-[var(--surface-text-muted)]">
            Muted Text: Captions, timestamps, and placeholder copy
            (--surface-text-muted)
          </div>
        </div>
      </div>
    </div>
  ),
};
