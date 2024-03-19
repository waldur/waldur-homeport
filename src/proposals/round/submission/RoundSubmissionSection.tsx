import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { formatDateTime, parseDate } from '@waldur/core/dateUtils';
import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { Call, Round } from '@waldur/proposals/types';

import { EditSubmissionInfoButton } from './EditSubmissionInfoButton';

interface RoundSubmissionSectionProps {
  round: Round;
  call: Call;
  refetch(): void;
  loading: boolean;
}

export const RoundSubmissionSection: FC<RoundSubmissionSectionProps> = ({
  round,
  call,
  refetch,
  loading,
}) => {
  const duration = useMemo(() => {
    if (!round.start_time || !round.cutoff_time) return null;
    const startDate = parseDate(round.start_time);
    const cutoffDate = parseDate(round.cutoff_time);
    const diff = cutoffDate.diff(startDate, 'days').toObject().days;
    if (diff > 0) {
      return cutoffDate.toRelative({ base: startDate });
    }
    return null;
  }, [round]);

  return (
    <Card id="submission" className="mb-7">
      <Card.Header>
        <Card.Title>
          {translate('Submission')}
          <RefreshButton refetch={refetch} loading={loading} />
        </Card.Title>
        <div className="card-toolbar">
          <EditSubmissionInfoButton
            round={round}
            call={call}
            refetch={refetch}
          />
        </div>
      </Card.Header>
      <Card.Body>
        <ReadOnlyFormControl
          label={translate('Start date')}
          value={
            round.start_time
              ? formatDateTime(round.start_time)
              : round.start_time
          }
          className="col-12 col-md-6"
          floating
        />
        <ReadOnlyFormControl
          label={translate('Cutoff date')}
          value={
            round.cutoff_time
              ? formatDateTime(round.cutoff_time)
              : round.cutoff_time
          }
          className="col-12 col-md-6"
          floating
        />
        {translate('Duration')}: {duration || '-'}
      </Card.Body>
    </Card>
  );
};
