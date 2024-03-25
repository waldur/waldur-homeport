import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { Call as Call, Round } from '@waldur/proposals/types';
import {
  formatRoundAllocationStrategy,
  formatRoundAllocationTime,
} from '@waldur/proposals/utils';

import { EditAllocationInfoButton } from './EditAllocationInfoButton';

interface RoundAllocationSectionProps {
  round: Round;
  call: Call;
  refetch(): void;
  loading: boolean;
}

export const RoundAllocationSection: FC<RoundAllocationSectionProps> = ({
  round,
  call,
  refetch,
  loading,
}) => {
  return (
    <Card id="allocation" className="mb-7">
      <Card.Header>
        <Card.Title>
          {translate('Allocation strategy')}
          <RefreshButton refetch={refetch} loading={loading} />
        </Card.Title>
        <div className="card-toolbar">
          <EditAllocationInfoButton
            round={round}
            call={call}
            refetch={refetch}
          />
        </div>
      </Card.Header>
      <Card.Body>
        <ReadOnlyFormControl
          label={translate('Deciding entity')}
          value={formatRoundAllocationStrategy(round.deciding_entity)}
          className="col-12 col-md-6"
          floating
        />
        <ReadOnlyFormControl
          label={translate('Minimum average scoring for allocation')}
          value={round.minimal_average_scoring}
          className="col-12 col-md-6"
          floating
        />
        <ReadOnlyFormControl
          label={translate('Allocation time')}
          value={formatRoundAllocationTime(round.allocation_time)}
          className="col-12 col-md-6"
          floating
        />
        {round.allocation_time === 'fixed_date' && (
          <ReadOnlyFormControl
            label={translate('Allocation date')}
            value={
              round.allocation_date
                ? formatDateTime(round.allocation_date)
                : round.allocation_date
            }
            className="col-12 col-md-6"
            floating
          />
        )}
      </Card.Body>
    </Card>
  );
};
