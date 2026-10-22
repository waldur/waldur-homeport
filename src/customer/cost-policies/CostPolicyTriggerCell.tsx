import { FC, ReactNode } from 'react';

import { Badge } from 'waldur-ui';

import { BooleanField } from '@/table/BooleanField';

import { getTriggerStatusView, TriggerStatusPolicy } from './triggerStatus';

interface CostPolicyTriggerCellProps {
  row: TriggerStatusPolicy;
  /** Shown after the "Action triggered" badge, e.g. the affected resources. */
  children?: ReactNode;
}

/** "Action triggered" with the reason the policy fires or waits.
 *
 * A policy over its limit whose actions have not run yet shows that instead of
 * a plain "No", which reads as a broken policy.
 */
export const CostPolicyTriggerCell: FC<CostPolicyTriggerCellProps> = ({
  row,
  children,
}) => {
  const status = getTriggerStatusView(row);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {!status?.pending && <BooleanField value={Boolean(row.has_fired)} />}
      {children}
      {status && (
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
          // Focusable, so the reason is reachable without a mouse.
          tabIndex={0}
          data-testid="cost-policy-trigger-status"
        >
          {status.label}
        </Badge>
      )}
      {status?.detail && (
        <span
          className="text-quaternary w-full text-xs"
          data-testid="cost-policy-trigger-detail"
        >
          {status.detail}
        </span>
      )}
    </div>
  );
};
