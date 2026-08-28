import { ReactNode } from 'react';

import { Badge } from './Badge';
import { Card, CardContent, CardTitle } from './Card';
import { cn } from './cn';
import { StatusTone } from './StatusPill';

/**
 * Ports a real, single, reusable KPI-tile component — src/core/StatsCard.tsx
 * (used via src/core/SummaryWidget.tsx by pages like
 * src/reporting/GrowthPage.tsx). Its real markup is one padded
 * `.card.card-flush.card-bordered` box (label, then value, then an
 * optional footer row) — composed here as a single CardContent, not a
 * CardHeader+CardContent split: CardHeader's own bottom padding is zeroed
 * on the assumption a footer section always follows to provide it, which
 * silently breaks (zero bottom padding) for a label+value-only card.
 *
 * Real values (root font-size is 13px in that app, not 16px — see
 * src/metronic/sass/layout/_variables.scss's $root-font-size; expressed
 * below as arbitrary rem values, not their px-at-13px-root equivalents,
 * so this actually stays in sync if the root font-size ever changes —
 * see Card.tsx's own comment on the same choice):
 * padding is `.card-body.py-5` = 2.25rem sides ($card-px, unchanged from
 * the default card) / 1.25rem top+bottom (Bootstrap's `.py-5` spacer,
 * overriding the default card's 2rem) — not Card.tsx's own 2.25rem/2rem.
 * The value is a hardcoded `style={{ fontSize: '32px' }}`, not a rem
 * token, so text-[32px] here matches it exactly rather than
 * approximating with Tailwind's own text-3xl (30px). The label is
 * `.fs-6.fw-bold` (14px) — Card.tsx's own CardTitle default (font-medium,
 * unmodified) already matches: this app's Metronic build overrides
 * Bootstrap's font-weight scale (src/metronic/sass/core/components/
 * _variables.scss: `$font-weight-bold: 500` — Bootstrap's own default is
 * 700 — `$font-weight-bolder: 600`), so real `.fw-bold` is genuinely
 * Tailwind's font-medium (500), not font-bold (700). The value's own
 * font-semibold (600) is correct as-is: it has no explicit weight class in
 * the real component, so it inherits `$headings-font-weight: $font-weight-bolder`
 * = 600 from its real `<h1>` tag. The card itself is `.card-bordered`
 * (unconditionally bordered, box-shadow: none in BOTH themes) — a
 * different real variant than Card.tsx's own default (theme-conditional
 * shadow-in-light/border-in-dark, see surfaceColors.css's comment on
 * --card-shadow/--card-border-color), so those are overridden here too.
 */
export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: {
    label: string;
    tone?: StatusTone;
  };
  className?: string;
}

export const StatCard = ({
  label,
  value,
  hint,
  trend,
  className,
}: StatCardProps) => (
  <Card
    className={cn(
      'shadow-none border-[var(--surface-card-border)]',
      // dark:bg override, not a change to --surface-card-bg itself: the
      // real bordered card (measured live via
      // e2e-visual/stat-card-parity.spec.ts) sits flush with the page in
      // dark mode (rgb(12,17,29) = --color-gray-950, same as
      // --surface-page-bg) rather than getting an elevated tint — a
      // border-only card doesn't need one. --surface-card-bg's dark value
      // (--color-gray-900, one step lighter) is correct for Card's default
      // shadow-only/no-border light-mode-style rendering elsewhere, which
      // has no live Metronic source to verify against yet — only this
      // specific bordered variant has been confirmed, so only this
      // instance is overridden.
      'dark:bg-[var(--surface-page-bg)]',
      className,
    )}
  >
    {/* No `gap` here: the real component uses two different row gaps
        (label->value is .mt-3 = 0.75rem, value->footer is .mt-2 = 0.5rem) —
        a single uniform gap-3 (measured via e2e-visual/stat-card-parity.spec.ts)
        made the value->footer gap 0.25rem too wide. Applied as mt-[..] on
        each row instead, as rem (not their px-at-13px-root equivalents —
        see this file's top comment on why). */}
    <CardContent className="flex flex-col px-[2.25rem] py-[1.25rem]">
      <CardTitle>{label}</CardTitle>
      {/* leading-[1.2] + mb-[0.5rem]: the real component renders this as an
          <h1>, which — unlike CardTitle's h3, deliberately zeroed above —
          keeps its real Bootstrap heading typography here: $headings-
          line-height: 1.2 (not the font's own much taller ~1.43 "normal"
          this div would otherwise inherit) and $headings-margin-bottom:
          0.5rem. That margin isn't just the gap before an optional footer
          (mt-[0.5rem] below already covers that as its own leading margin)
          — it's real trailing space on the value itself, present even with
          no footer at all, confirmed via e2e-visual/stat-card-parity.spec.ts:
          without it, this card measured ~0.5rem short. */}
      <div className="mt-[0.75rem] mb-[0.5rem] text-[32px] leading-[1.2] font-semibold text-[var(--surface-text-primary)]">
        {value}
      </div>
      {(trend || hint) && (
        <div className="mt-[0.5rem] flex flex-wrap items-center gap-2 text-sm">
          {trend && (
            <Badge variant={trend.tone ?? 'neutral'}>{trend.label}</Badge>
          )}
          {hint && (
            <span className="text-[var(--surface-text-muted)]">{hint}</span>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);
