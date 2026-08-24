import { ReactNode } from 'react';

import { Badge } from './Badge';
import { Card, CardContent, CardTitle } from './Card';
import { cn } from './cn';
import { StatusTone } from './StatusPill';

/**
 * There IS a real, single, reusable KPI-tile component this ports —
 * src/core/StatsCard.tsx (used via src/core/SummaryWidget.tsx by pages
 * like src/reporting/GrowthPage.tsx) — not a from-scratch shape as an
 * earlier version of this comment claimed. Its real markup is one padded
 * `.card.card-flush.card-bordered` box (label, then value, then an
 * optional footer row), not this component's previous header+content
 * split — that split left a real gap: CardHeader's own bottom padding was
 * zeroed on the assumption a footer section would always follow to
 * provide it, which silently broke (zero bottom padding) for any
 * label+value-only card. Composed as one CardContent now instead.
 *
 * Real values (root font-size is 13px in that app, not 16px — see
 * src/metronic/sass/layout/_variables.scss's $root-font-size, so its rem
 * values below are recalculated against 13px, not the 16px this app's
 * own tailwind.css correctly uses instead — see that file's comment):
 * padding is `.card-body.py-5` = 29.25px sides ($card-px, unchanged from
 * the default card) / 16.25px top+bottom (Bootstrap's `.py-5` spacer,
 * overriding the default card's 26px) — not Card.tsx's own 29px/26px.
 * The value is a hardcoded `style={{ fontSize: '32px' }}`, not a rem
 * token, so text-[32px] here matches it exactly rather than
 * approximating with Tailwind's own text-3xl (30px). The label is
 * `.fs-6.fw-bold` (14px) — Card.tsx's own CardTitle default (font-medium,
 * unmodified) already matches: this app's Metronic build overrides
 * Bootstrap's font-weight scale (src/metronic/sass/core/components/
 * _variables.scss: `$font-weight-bold: 500` — Bootstrap's own default is
 * 700 — `$font-weight-bolder: 600`), so real `.fw-bold` is genuinely
 * Tailwind's font-medium (500), not font-bold (700); an earlier version
 * of this component added an unnecessary (and wrong) font-bold override
 * here on that mistaken assumption. The value's own font-semibold (600)
 * is correct as-is: it has no explicit weight class in the real
 * component, so it inherits `$headings-font-weight: $font-weight-bolder`
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
    className={cn('shadow-none border-[var(--surface-card-border)]', className)}
  >
    <CardContent className="flex flex-col gap-3 px-[29px] py-[16px]">
      <CardTitle>{label}</CardTitle>
      <div className="text-[32px] font-semibold text-[var(--surface-text-primary)]">
        {value}
      </div>
      {(trend || hint) && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
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
