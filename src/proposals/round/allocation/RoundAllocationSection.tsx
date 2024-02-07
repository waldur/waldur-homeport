import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { ProposalCall, ProposalCallRound } from '@waldur/proposals/types';

import { EditAllocationInfoButton } from './EditAllocationInfoButton';

interface RoundAllocationSectionProps {
  round: ProposalCallRound;
  call: ProposalCall;
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
          {translate('Allocation')}
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
          key={round.deciding_entity}
          label={translate('Deciding entity')}
          value={round.deciding_entity}
          className="col-12 col-md-6"
          floating
        />
        <ReadOnlyFormControl
          key={round.max_allocations}
          label={translate('Maximum accepted proposals')}
          value={round.max_allocations}
          className="col-12 col-md-6"
          floating
        />
        <ReadOnlyFormControl
          key={round.minimal_average_scoring}
          label={translate('Minimum average scoring for allocation')}
          value={round.minimal_average_scoring}
          className="col-12 col-md-6"
          floating
        />
        <ReadOnlyFormControl
          key={round.allocation_time}
          label={translate('Allocation time')}
          value={round.allocation_time}
          className="col-12 col-md-6"
          floating
        />
        {round.allocation_time === 'Fixed date' && (
          <ReadOnlyFormControl
            key={round.allocation_date}
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
