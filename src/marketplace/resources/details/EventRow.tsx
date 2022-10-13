import { formatDateTime } from '@waldur/core/dateUtils';
import eventsRegistry from '@waldur/events/registry';
import { Event } from '@waldur/events/types';

import { EventIcon } from './EventIcon';

export const EventRow = ({ event }: { event: Event }) => (
  <div className="timeline-item">
    <div className="timeline-line w-40px"></div>
    <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
      <EventIcon type={event.event_type} />
    </div>
    <div className="timeline-content mb-10 mt-n1">
      <div className="pe-3 mb-5">
        <div className="fs-5 fw-semibold mb-2">
          {eventsRegistry.formatEvent(event)}
        </div>
        <div className="d-flex align-items-center mt-1 fs-6">
          <div className="text-muted me-2 fs-7">
            {formatDateTime(event.created)}
          </div>
        </div>
      </div>
    </div>
  </div>
);
