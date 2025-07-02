import { ProtectedRound } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

interface RoundPageHeaderBodyProps {
  round: ProtectedRound;
}

export const RoundPageHeaderBody = (props: RoundPageHeaderBodyProps) => {
  return (
    <div className="d-flex gap-3">
      <div>
        <span className="fw-bolder me-2">{translate('Start date')}:</span>
        <span className="text-muted">
          {formatDateTime(props.round.start_time)}
        </span>
      </div>
      <div>
        <span className="fw-bolder me-2">{translate('End date')}:</span>
        <span className="text-muted">
          {formatDate(props.round.cutoff_time)}
        </span>
      </div>
    </div>
  );
};
