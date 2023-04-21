import { useQuery } from '@tanstack/react-query';
import { Card } from 'react-bootstrap';

import { get } from '@waldur/core/api';
import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { translate } from '@waldur/i18n';
import { EventRow } from '@waldur/marketplace/resources/details/EventRow';

export const ProviderActionLogs = ({ provider }) => {
  const result = useQuery(['provider-events'], ({ signal }) => {
    return get<any[]>('/events/', {
      signal,
      params: {
        scope: provider ? provider.customer : undefined,
        feature: ['customers'],
        page_size: 2,
        field: ['created', 'event_type', 'message', 'uuid', 'context'],
      },
    }).then((res) => res.data);
  });

  return (
    <Card className="min-h-225px mb-6">
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
          ) : !Array.isArray(result.data) || result.data.length === 0 ? (
            <p className="text-center">
              {translate('There are no provider events.')}
            </p>
          ) : (
            <div className="timeline">
              {result.data.map((row, index) => (
                <EventRow
                  row={row}
                  key={index}
                  last={index === result.data.length - 1}
                />
              ))}
            </div>
          )}

          <Link
            state="#"
            className="btn btn-light btn-sm min-w-100px align-self-end"
          >
            {translate('Audit log')}
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};
