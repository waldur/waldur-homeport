import { FC, ReactNode } from 'react';

import { Badge } from 'waldur-ui';

import { BooleanField } from '@/table/BooleanField';

import {
  getTriggerStatusView,
  TriggerStatusPolicy,
  TriggerStatusView,
} from './triggerStatus';

/** The reason, then what the cost is made of, then what happens next. */
const TriggerStatusTooltip: FC<{ status: TriggerStatusView }> = ({
  status,
}) => {
  const lines = [
    status.explanation,
    status.breakdown,
    status.earlier,
    status.note,
  ].filter(Boolean);
  if (lines.length === 1) {
    return <>{lines[0]}</>;
  }
  return (
    <>
      {lines.map((line, index) => (
        <p key={index} className={index === lines.length - 1 ? 'mb-0' : 'mb-1'}>
          {line}
        </p>
      ))}
    </>
  );
};

interface CostPolicyTriggerCellProps {
  row: TriggerStatusPolicy;
  /** Shown after the status, e.g. the affected resources. */
  children?: ReactNode;
}

/** "Action triggered" as one badge, with the reason in its tooltip.
 *
 * The badge already answers yes or no, so a separate Yes/No is shown only for
 * an older backend that sends no `trigger_status`. A policy over its limit
 * whose actions have not run yet says so, instead of a plain "No" that reads
 * as a broken policy. The figures behind the reason stay in the tooltip, so
 * every row is one line.
 */
export const CostPolicyTriggerCell: FC<CostPolicyTriggerCellProps> = ({
  row,
  children,
}) => {
  const status = getTriggerStatusView(row);
  return (
    <div className="flex items-center gap-1.5">
      {status ? (
        <Badge
          variant={status.variant}
          shape="pill"
          tone="outline"
          tooltip={<TriggerStatusTooltip status={status} />}
          className="whitespace-nowrap"
          // Focusable, so the reason is reachable without a mouse.
          tabIndex={0}
          data-testid="cost-policy-trigger-status"
        >
          {status.label}
        </Badge>
      ) : (
        <BooleanField value={Boolean(row.has_fired)} />
      )}
      {children}
    </div>
  );
};
