import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { WaldurResourceForLinking } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { SimpleTable } from '@/table/SimpleTable';

interface WaldurResourcesListProps {
  resources: WaldurResourceForLinking[];
}

// Every resource is in the discovery response, so the list scrolls rather
// than pages.
const WaldurResourcesTable: FC<WaldurResourcesListProps> = ({ resources }) => (
  <div className="max-h-[300px] overflow-y-auto">
    <SimpleTable<WaldurResourceForLinking>
      columns={[
        {
          title: translate('Resource'),
          render: ({ row }) => <strong>{row.name}</strong>,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.project_name || DASH_ESCAPE_CODE}</>,
        },
        {
          title: translate('Offering'),
          render: ({ row }) => <>{row.offering_name || DASH_ESCAPE_CODE}</>,
        },
        {
          title: translate('Current backend_id'),
          render: ({ row }) =>
            row.backend_id ? (
              <span className="text-success">{row.backend_id}</span>
            ) : (
              <span className="text-quaternary">{translate('Not set')}</span>
            ),
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <Badge
              variant={
                row.state === 'OK'
                  ? 'success'
                  : row.state === 'Erred'
                    ? 'danger'
                    : 'secondary'
              }
            >
              {row.state}
            </Badge>
          ),
        },
      ]}
      rows={resources}
    />
  </div>
);

export const WaldurResourcesList: FC<WaldurResourcesListProps> = ({
  resources,
}) => (
  <Card>
    <Card.Header>
      <h5 className="mb-0">
        {translate('Waldur Resources')}
        <Badge variant="neutral" tone="outline" className="ms-1.5">
          {resources?.length || 0}
        </Badge>
      </h5>
    </Card.Header>
    <Card.Body className="p-0">
      {!resources || resources.length === 0 ? (
        <div className="text-center text-quaternary py-5">
          {translate('No resources found for this customer')}
        </div>
      ) : (
        <WaldurResourcesTable resources={resources} />
      )}
    </Card.Body>
  </Card>
);
