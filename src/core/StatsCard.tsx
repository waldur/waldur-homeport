import { FC, ReactNode } from 'react';

import { Card, CardContent } from 'waldur-ui';

/**
 * HomePort's figure tile. Not the same component as waldur-ui's `StatCard`,
 * though both now draw a bordered `Card`: this one takes an `icon` and a
 * free-form `footer`, while `StatCard` has no icon and takes a structured
 * `trend` ({ label, tone }) it renders as a Badge. The two were once an
 * old-vs-new pair held to pixel parity by e2e-visual/stat-card-parity.spec.ts;
 * that spec went when this component moved off Metronic's `.card` CSS, since
 * nothing renders the old half any more. Reconciling the two APIs is still
 * open work — until then, neither is a drop-in for the other.
 */
interface StatsCardProps {
  label: ReactNode;
  value: ReactNode;
  /** Optional glyph in the top-right corner, naming what the figure measures. */
  icon?: ReactNode;
  /** Optional line under the value — a delta badge, a comparison, a caption. */
  footer?: ReactNode;
}

export const StatsCard: FC<StatsCardProps> = ({
  label,
  value,
  icon,
  footer,
}) => (
  <Card bordered className="h-full">
    <CardContent className="flex py-4 flex-col">
      <div className="flex justify-between items-start gap-1.5">
        <div className="text-sm font-medium text-quaternary">{label}</div>
        {icon}
      </div>
      <div className="grow mt-2.5">
        <h1 className="text-3xl font-bold">{value}</h1>
      </div>
      {footer && (
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {footer}
        </div>
      )}
    </CardContent>
  </Card>
);
