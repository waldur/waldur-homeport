import { cva, type VariantProps } from 'class-variance-authority';
import { CSSProperties, HTMLAttributes } from 'react';

import { cn } from './cn';

/**
 * src/core/Badge.tsx's real Metronic recipe (src/metronic/sass/core/
 * components/_badge.scss) — variant (color) × tone (solid/light/outline),
 * built out following a real usage audit of all 429 real call sites (see
 * the Badge migration brainstorm): outline (89% of usages) and pill (67%)
 * are the dominant real shape, not solid-fill, which is why both are
 * first-class here rather than afterthoughts.
 *
 * variant/tone don't enumerate every combination as a literal Tailwind
 * class (that's a 12-variant × 3-tone = 36-entry cva explosion Tailwind's
 * static analysis can't see through anyway, since the class name would be
 * built from a template literal at runtime). Instead this component sets
 * three scoped custom properties (--badge-bg/-text/-border) via inline
 * style to the *specific* variant+tone token (e.g.
 * var(--badge-success-outline-bg)), and the one static Tailwind class
 * (bg-[var(--badge-bg)] etc.) just reads whichever value is currently
 * assigned — ordinary nested CSS custom property resolution, which the
 * browser handles regardless of Tailwind. See badgeColors.css for the
 * real, per-variant/tone token values.
 *
 * Deliberately NOT ported this pass (near-zero real usage in the audit —
 * follow-up work, not guessed at): leftIcon/rightIcon/onlyIcon, tooltip/
 * tooltipProps, hasBullet. alignIcon (zero real callers) is dropped
 * entirely, not carried forward.
 */
export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple'
  | 'blue'
  | 'indigo'
  | 'moss'
  | 'pink';

export type BadgeTone = 'solid' | 'light' | 'outline';

const badgeVariants = cva(
  // Base font-size/line-height/padding matches Metronic's real un-sized
  // `.badge` — NOT Tailwind's numbered text-xs/px-2.5/py-0.5 (those
  // resolve against Tailwind's own --spacing/--text-xs, which this app's
  // real 13px root shadows — same gotcha StatCard.tsx hit; see
  // docs/tailwind-shadcn-migration-notes.md). font-size is source-
  // confirmed: src/metronic/sass/_variables.custom.scss overrides
  // $badge-font-size to 1.075rem (exactly the 13.975px measured live at
  // this app's 13px root). line-height (20px) and padding (1px/9px) are
  // live-measured, not derived from $badge-padding-x/y — those variables'
  // own em-based math didn't reproduce the real rendered values, so
  // measurement won here per this project's own "measure, don't guess"
  // convention, same as colors.css's own success-ramp caveat. font-medium
  // (500), not font-semibold (600) — real Metronic bold measured live at
  // 500, same $font-weight-bold override StatCard.tsx's own comment
  // documents (Bootstrap's own default is 700, and even Tailwind's
  // font-semibold's 600 overshoots it).
  // rounded-[8px], not rounded-md (6px) — Metronic's real
  // $badge-border-radius is $border-radius, which this app overrides to
  // 8px in _variables.custom.scss (Tailwind's own default is 6px).
  // border-[1px], not the bare `border` utility — Bootstrap (still loaded
  // globally during this migration) ships its own `.border { border: 1px
  // solid #e4e7ec !important; }` utility under the exact same class name.
  // Tailwind's bare `border` utility compiles to a literal `.border`
  // class too, so on pages where Bootstrap's rule's cascade-layer
  // position beats Tailwind's, its !important silently wins and every
  // badge gets Bootstrap's flat gray border regardless of
  // --badge-border. border-[1px] compiles to a differently-named
  // class, sidestepping the collision entirely rather than depending on
  // layer/specificity order to not lose.
  'inline-flex items-center rounded-[8px] border-[1px] text-[1.075rem] leading-[20px] py-[1px] px-[9px] font-medium transition-colors bg-[var(--badge-bg)] text-[var(--badge-text)] border-[var(--badge-border)]',
  {
    variants: {
      size: {
        // sm/lg font-size is source-confirmed ($badge-font-size-sm: 0.85rem,
        // $badge-font-size-lg: 1rem) but their padding isn't independently
        // measured yet — low priority, near-zero real usage combines size
        // with anything this pass actually verifies. Follow-up work.
        sm: 'px-[8px] py-[2px] text-[0.85rem]',
        lg: 'px-[12px] py-[5px] text-[1rem]',
      },
      pill: {
        true: 'rounded-full',
      },
      roundless: {
        true: 'rounded-none',
      },
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  variant?: BadgeVariant;
  tone?: BadgeTone;
}

export function Badge({
  className,
  variant = 'primary',
  tone = 'solid',
  size,
  pill,
  roundless,
  style,
  ...props
}: BadgeProps) {
  const badgeStyle = {
    '--badge-bg': `var(--badge-${variant}-${tone}-bg)`,
    '--badge-text': `var(--badge-${variant}-${tone}-text)`,
    // Real Metronic recipe: solid AND light both set border to the *same*
    // color as their own background (_badge.scss's `border: 1px solid
    // $value`/`border: 1px solid theme-light-color(...)`) — not
    // transparent. Using transparent here instead measured as a real,
    // visible ~1px antialiasing halo difference around the whole
    // perimeter (16%+ pixel diff in e2e-visual/badge-parity.spec.ts's
    // first run). The var(...) fallback exists for one measured
    // exception: dark-theme primary-solid's real border (brand-600) isn't
    // its own bg (brand-300) — badgeColors.css defines
    // --badge-primary-solid-border only for that case; every other
    // variant/tone/theme combination falls through to bg, matching what
    // was actually measured.
    '--badge-border':
      tone === 'outline'
        ? `var(--badge-${variant}-outline-border)`
        : `var(--badge-${variant}-${tone}-border, var(--badge-${variant}-${tone}-bg))`,
    ...style,
  } as CSSProperties;

  return (
    <span
      className={cn(badgeVariants({ size, pill, roundless }), className)}
      style={badgeStyle}
      {...props}
    />
  );
}
