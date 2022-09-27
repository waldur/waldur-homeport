import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import eventsRegistry from '@waldur/events/registry';
import { Event } from '@waldur/events/types';
import { translate } from '@waldur/i18n';

const EVENT_ICONS = {
  resource_creation_failed: 'fa-warning',
  resource_creation_scheduled: 'fa-spinner',
  resource_creation_succeeded: 'fa-check',
};

export const ResourceTimeline = ({ resource }) => {
  const { loading, error, value } = useAsync(() =>
    get<Event[]>('/events/', { params: { scope: resource.url } }),
  );
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <p className="text-center">
        {translate('Unable to fetch resource events.')}
      </p>
    );
  }
  if (value.data.length === 0) {
    return (
      <p className="text-center">
        {translate('There are no resource events.')}
      </p>
    );
  }

  return (
    <>
      <div className="timeline">
        {value.data.map((event, index) => {
          const eventIcon = EVENT_ICONS[event.event_type];
          return (
            <div key={index} className="timeline-item">
              <div className="timeline-line w-40px"></div>
              <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
                <div className="symbol-label bg-light">
                  {eventIcon && <i className={`fa ${eventIcon}`} />}
                </div>
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
        })}
      </div>
      <p className="text-center">
        <a>{translate('See more')}</a>
      </p>
    </>
  );
};
