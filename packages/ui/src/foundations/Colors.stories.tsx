import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: {
    docs: {
      description: {
        component:
          "Design tokens defining Waldur's color palette: runtime brand scales, base scales (grays, errors, warnings, success), and contextual surface tokens that automatically respond to theme and tenant branding.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

interface SwatchProps {
  label: string;
  cssVar: string;
  hexFallback?: string;
  textColor?: string;
}

function ColorSwatch({ label, cssVar, hexFallback, textColor }: SwatchProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] shadow-xs">
      <div
        className="h-16 w-full flex items-center justify-center font-mono text-xs font-medium"
        style={{
          backgroundColor: hexFallback || `var(${cssVar})`,
          color: textColor || 'inherit',
        }}
      >
        <span className="rounded bg-black/20 px-1.5 py-0.5 text-white backdrop-blur-xs">
          {label}
        </span>
      </div>
      <div className="p-2 text-xs">
        <div className="font-semibold text-[var(--surface-text-primary)]">
          {label}
        </div>
        <div className="font-mono text-[var(--surface-text-muted)] text-[10px] truncate">
          {cssVar}
        </div>
      </div>
    </div>
  );
}

function SwatchGrid({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-[var(--surface-text-primary)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-[var(--surface-text-secondary)] mb-3">
          {description}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10">
        {children}
      </div>
    </div>
  );
}

/**
 * The Brand color ramp is dynamically computed from tenant configuration at bootstrap
 * via `--waldur-brand-color` and `--waldur-brand-*` variables.
 */
export const BrandScale: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)]">
      <SwatchGrid
        title="Dynamic Brand Palette"
        description="Tenant-configurable ramp derived at runtime from --waldur-brand-color"
      >
        <ColorSwatch label="50" cssVar="--waldur-brand-50" textColor="#000" />
        <ColorSwatch label="100" cssVar="--waldur-brand-100" textColor="#000" />
        <ColorSwatch label="200" cssVar="--waldur-brand-200" textColor="#000" />
        <ColorSwatch label="300" cssVar="--waldur-brand-300" textColor="#000" />
        <ColorSwatch label="400" cssVar="--waldur-brand-400" textColor="#000" />
        <ColorSwatch label="500" cssVar="--waldur-brand-500" textColor="#fff" />
        <ColorSwatch label="600" cssVar="--waldur-brand-600" textColor="#fff" />
        <ColorSwatch label="700" cssVar="--waldur-brand-700" textColor="#fff" />
        <ColorSwatch label="800" cssVar="--waldur-brand-800" textColor="#fff" />
        <ColorSwatch label="900" cssVar="--waldur-brand-900" textColor="#fff" />
      </SwatchGrid>
    </div>
  ),
};

/**
 * Base Neutrals and Semantic Color Ramps from colors.css.
 */
export const SemanticRamps: Story = {
  render: () => (
    <div className="p-6 space-y-6 bg-[var(--surface-page-bg)]">
      <SwatchGrid
        title="Gray Ramp"
        description="Theme-aware neutrals used for chrome, typography, borders, and backdrops"
      >
        {[25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
          (step) => (
            <ColorSwatch
              key={step}
              label={String(step)}
              cssVar={`--color-gray-${step}`}
              textColor={step > 400 ? '#fff' : '#000'}
            />
          ),
        )}
      </SwatchGrid>

      <SwatchGrid
        title="Success Ramp"
        description="Waldur-specific verified green scale used for successful states, active resources, and pills"
      >
        {[25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
          (step) => (
            <ColorSwatch
              key={step}
              label={String(step)}
              cssVar={`--color-success-${step}`}
              textColor={step > 400 ? '#fff' : '#000'}
            />
          ),
        )}
      </SwatchGrid>

      <SwatchGrid
        title="Warning Ramp"
        description="Amber scale used for caution, quota risks, pending tasks, and expirations"
      >
        {[25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
          (step) => (
            <ColorSwatch
              key={step}
              label={String(step)}
              cssVar={`--color-warning-${step}`}
              textColor={step > 400 ? '#fff' : '#000'}
            />
          ),
        )}
      </SwatchGrid>

      <SwatchGrid
        title="Error / Danger Ramp"
        description="Red scale used for destructive actions, errors, failed jobs, and critical alerts"
      >
        {[25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
          (step) => (
            <ColorSwatch
              key={step}
              label={String(step)}
              cssVar={`--color-error-${step}`}
              textColor={step > 400 ? '#fff' : '#000'}
            />
          ),
        )}
      </SwatchGrid>
    </div>
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
