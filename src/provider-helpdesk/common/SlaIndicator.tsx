import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

interface SlaIndicatorProps {
  slaBreached: boolean;
  resolutionDeadline: string | null;
  created: string;
}

/**
 * SLA status driven by real backend fields (breach flag + deadlines),
 * not a hardcoded time heuristic. "At risk" once 80% of the window elapsed,
 * matching the backend SLA-warning threshold.
 */
export const SlaIndicator: FC<SlaIndicatorProps> = ({
  slaBreached,
  resolutionDeadline,
  created,
}) => {
  if (slaBreached) {
    return (
      <Badge variant="danger" pill outline>
        {translate('SLA breached')}
      </Badge>
    );
  }
  if (!resolutionDeadline) {
    return <>{renderFieldOrDash(null)}</>;
  }

  const now = Date.now();
  const deadline = new Date(resolutionDeadline).getTime();
  const start = new Date(created).getTime();

  if (now > deadline) {
    return (
      <Badge variant="danger" pill outline>
        {translate('Overdue')}
      </Badge>
    );
  }

  const elapsed = deadline > start ? (now - start) / (deadline - start) : 0;
  const atRisk = elapsed >= 0.8;

  return (
    <Badge
      variant={atRisk ? 'warning' : 'success'}
      pill
      outline
      tooltip={translate('Due {time}', {
        time: formatRelative(resolutionDeadline),
      })}
    >
      {atRisk ? translate('At risk') : translate('On track')}
    </Badge>
  );
};
