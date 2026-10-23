import { FC, ReactNode } from 'react';

import { Badge } from 'waldur-ui';

import { BooleanField } from '@/table/BooleanField';

import { getTriggerStatusView, TriggerStatusPolicy } from './triggerStatus';

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
    <div className="flex items-center gap-2">
      {status ? (
        <Badge
          variant={status.variant}
          shape="pill"
          tone="outline"
          tooltip={
            status.note ? (
              <>
                <p className="mb-1">{status.explanation}</p>
                <p className="mb-0">{status.note}</p>
              </>
            ) : (
              status.explanation
            )
          }
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
