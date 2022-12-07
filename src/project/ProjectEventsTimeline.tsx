import { Card } from 'react-bootstrap';
import { useQuery } from 'react-query';

import { get } from '@waldur/core/api';
import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { translate } from '@waldur/i18n';
import { EventRow } from '@waldur/marketplace/resources/details/EventRow';

export const ProjectEventsTimeline = ({ project }) => {
  const result = useQuery('project-events', ({ signal }) => {
    return get<any[]>('/events/', {
      signal,
      params: {
        scope: project ? project.url : undefined,
        feature: ['projects', 'resources'],
        page_size: 4,
        field: ['created', 'event_type', 'message', 'uuid'],
      },
    }).then((res) => res.data);
  });

  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex flex-column justify-content-between h-100">
          {result.status === 'loading' ? (
            <p className="text-center">{translate('Loading')}</p>
          ) : result.status === 'error' ? (
            <p className="text-center">
              {
                <LoadingErred
                  loadData={result.refetch}
                  message={(result.error as any)?.message}
                />
              }
            </p>
          ) : result.data.length === 0 ? (
            <p className="text-center">
              {translate('There are no project events.')}
            </p>
          ) : (
            <div className="timeline">
              {result.data.map((row, index) => (
                <EventRow row={row} key={index} />
              ))}
            </div>
          )}

          <Link
            state="project.events"
            params={{ uuid: project.uuid }}
            className="btn btn-light btn-sm min-w-100px align-self-end"
          >
            {translate('Audit log')}
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};
