import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

import { useTeamWorkload } from '../api';
import { CapacityIndicator } from '../common/CapacityIndicator';

/** Per-member capacity cards shown above the team table. */
export const TeamWorkload: FC<{ helpdeskUuid: string }> = ({
  helpdeskUuid,
}) => {
  const { data: workload = [] } = useTeamWorkload(helpdeskUuid);
  if (!workload.length) return null;
  return (
    <div className="row g-3 mb-4">
      {workload.map((member) => (
        <div className="col-sm-6 col-lg-3" key={member.uuid}>
          <div className="card card-bordered h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong className="text-truncate">
                  {member.user_full_name}
                </strong>
                {!member.has_capacity && (
                  <Badge variant="danger" pill outline>
                    {translate('At capacity')}
                  </Badge>
                )}
              </div>
              <CapacityIndicator
                open={member.open_ticket_count}
                max={member.max_open_tickets}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
