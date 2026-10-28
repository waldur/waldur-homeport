import { FC } from 'react';

import { Badge } from 'waldur-ui';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
      {workload.map((member) => (
        <div className="card card-bordered h-full" key={member.uuid}>
          <div className="card-body">
            <div className="flex justify-between items-center mb-1.5">
              <strong className="truncate">{member.user_full_name}</strong>
              {!member.has_capacity && (
                <Badge variant="danger" shape="pill" tone="outline">
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
      ))}
    </div>
  );
};
