import { formatDateTime } from '@waldur/core/dateUtils';
import eventsRegistry from '@waldur/events/registry';
import { Event } from '@waldur/events/types';

import { EventIcon } from './EventIcon';

export const EventRow = ({ row, last }: { row: Event; last?: boolean }) => (
  <div className="timeline-item">
    <div className="timeline-line w-40px"></div>
    <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
      <EventIcon type={row.event_type} />
    </div>
    <div className={'timeline-content mt-n1 ' + (last ? 'mb-0' : 'mb-15')}>
      <div className="pe-3">
        <div className="fs-5 fw-semibold mb-2">
          {eventsRegistry.formatEvent(row)}
        </div>
        <div className="d-flex align-items-center mt-1 fs-6">
          <div className="text-muted me-2 fs-7">
            {formatDateTime(row.created)}
          </div>
        </div>
      </div>
    </div>
  </div>
);
