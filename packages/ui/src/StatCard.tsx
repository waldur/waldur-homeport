import { ReactNode } from 'react';

import { Badge } from './Badge';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { cn } from './cn';
import { StatusTone } from './StatusPill';

/**
 * The dashboard mockup's stat-tile shape, composed from the shadcn-recipe
 * Card and Badge (see Card.tsx/Badge.tsx) rather than a bespoke card shell
 * and a second copy of the tone→color mapping. waldur-homeport's own src/
 * has many ad hoc, feature-specific summary-card components (several
 * *SummaryCards.tsx files under src/reporting/) but no single reusable
 * one; this is the first.
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
  <Card className={cn('gap-3', className)}>
    <CardHeader className="gap-3 pb-0">
      <CardTitle>{label}</CardTitle>
      <div className="text-3xl font-semibold text-[var(--surface-text-primary)]">
        {value}
      </div>
    </CardHeader>
    {(trend || hint) && (
      <CardContent className="flex items-center gap-2 pt-3 text-sm">
        {trend && (
          <Badge variant={trend.tone ?? 'neutral'}>{trend.label}</Badge>
        )}
        {hint && (
          <span className="text-[var(--surface-text-muted)]">{hint}</span>
        )}
      </CardContent>
    )}
  </Card>
);
