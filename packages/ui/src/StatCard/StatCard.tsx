import { ReactNode } from 'react';

import { Badge, type BadgeVariant } from '../Badge';
import { Card, CardContent } from '../Card';
import { cn } from '../cn';

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
 * src/styles/bootstrap/_variables.scss's $font-size-root; expressed
 * below as arbitrary rem values, not their px-at-13px-root equivalents,
 * so this actually stays in sync if the root font-size ever changes —
 * see Card.tsx's own comment on the same choice):
 * padding is `.card-body.py-5` = 1.85rem sides ($card-px in _variables.scss,
 * mapped to var(--card-padding-x, 1.85rem)) / 1.25rem top+bottom (Bootstrap's `.py-5`
 * spacer, overriding the default card's 1.23rem).
 * The value is a hardcoded `style={{ fontSize: '32px' }}`, not a rem
 * token, so text-[32px] here matches it exactly rather than
 * approximating with Tailwind's own text-3xl (30px). The label is
 * `.text-sm.font-medium.text-quaternary` matching src/core/StatsCard.tsx directly.
 * The value's own font-semibold (600) is correct as-is: it has no explicit weight
 * class in the real component, so it inherits `$headings-font-weight: $font-weight-bolder`
 * = 600 from its real `<h1>` tag. The card itself is `.card-bordered`
 * (Card's `bordered`).
 */
export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: {
    label: string;
    tone?: BadgeVariant;
  };
  /**
   * `sm` is the compact tile for dense grids of figures (five or six to a
   * row, often inside another card): 1rem padding, an 18px value that wraps
   * rather than overflowing, and a 12px label and hint.
   */
  size?: 'md' | 'sm';
  className?: string;
}

export const StatCard = ({
  label,
  value,
  hint,
  trend,
  size = 'md',
  className,
}: StatCardProps) => (
  <Card bordered className={className}>
    {/* No `gap` here: the real component uses two different row gaps
        (label->value is .mt-3 = 0.75rem, value->footer is .mt-2 = 0.5rem) —
        a single uniform gap-3 (measured against the Bootstrap original by
        the since-removed e2e-visual/stat-card-parity.spec.ts)
        made the value->footer gap 0.25rem too wide. Applied as mt-[..] on
        each row instead, as rem (not their px-at-13px-root equivalents —
        see this file's top comment on why). */}
    <CardContent
      className={cn(
        'flex flex-col',
        size === 'sm'
          ? 'min-w-0 p-[1rem]'
          : 'px-[var(--card-padding-x,1.85rem)] py-[1.25rem]',
      )}
    >
      <div
        className={cn(
          'font-medium',
          size === 'sm' ? 'text-xs text-tertiary' : 'text-sm text-quaternary',
        )}
      >
        {label}
      </div>
      {/* leading-[1.2] + mb-[0.5rem]: the real component renders this as an
          <h1>, which — unlike CardTitle's h3, deliberately zeroed above —
          keeps its real Bootstrap heading typography here: $headings-
          line-height: 1.2 (not the font's own much taller ~1.43 "normal"
          this div would otherwise inherit) and $headings-margin-bottom:
          0.5rem. That margin isn't just the gap before an optional footer
          (mt-[0.5rem] below already covers that as its own leading margin)
          — it's real trailing space on the value itself, present even with
          no footer at all, confirmed against the Bootstrap original by the
          since-removed e2e-visual/stat-card-parity.spec.ts: without it, this
          card measured ~0.5rem short. */}
      <div
        className={cn(
          'font-semibold text-primary',
          size === 'sm'
            ? 'mt-[0.25rem] text-lg break-words'
            : 'mt-[0.75rem] mb-[0.5rem] text-[32px] leading-[1.2]',
        )}
      >
        {value}
      </div>
      {(trend || hint) && (
        <div
          className={cn(
            'flex flex-wrap items-center gap-1.5',
            size === 'sm' ? 'mt-[0.25rem] text-xs' : 'mt-[0.5rem] text-sm',
          )}
        >
          {trend && (
            <Badge variant={trend.tone ?? 'neutral'}>{trend.label}</Badge>
          )}
          {hint && (
            <span className={size === 'sm' ? 'text-tertiary' : 'text-quinary'}>
              {hint}
            </span>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);
