import { FC } from 'react';

import { formatDateTime } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';

/** Whether a round report is in: submitted, and when, or still pending. */
export const RoundReportStatus: FC<{ submittedAt?: string | null }> = ({
  submittedAt,
}) =>
  submittedAt ? (
    <StateIndicator
      label={translate('Submitted {date}', {
        date: formatDateTime(submittedAt),
      })}
      variant="success"
      tone="outline"
      shape="pill"
      size="sm"
    />
  ) : (
    <StateIndicator
      label={translate('Pending')}
      variant="warning"
      tone="outline"
      shape="pill"
      size="sm"
    />
  );
