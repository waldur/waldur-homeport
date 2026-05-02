import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';
import { WaldurResourceForLinking } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

interface WaldurResourcesListProps {
  resources: WaldurResourceForLinking[];
}

export const WaldurResourcesList: FC<WaldurResourcesListProps> = ({
  resources,
}) => (
  <Card>
    <Card.Header>
      <h5 className="mb-0">
        {translate('Waldur Resources')}
        <Badge variant="default" outline className="ms-2">
          {resources?.length || 0}
        </Badge>
      </h5>
    </Card.Header>
    <Card.Body className="p-0">
      {!resources || resources.length === 0 ? (
        <div className="text-center text-muted py-6">
          {translate('No resources found for this customer')}
        </div>
      ) : (
        <div className="table-responsive" style={{ maxHeight: '300px' }}>
          <Table className="mb-0" size="sm">
            <thead className="sticky-top bg-white">
              <tr>
                <th>{translate('Resource')}</th>
                <th>{translate('Project')}</th>
                <th>{translate('Offering')}</th>
                <th>{translate('Current backend_id')}</th>
                <th>{translate('State')}</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.uuid}>
                  <td>
                    <strong>{resource.name}</strong>
                  </td>
                  <td>{resource.project_name || DASH_ESCAPE_CODE}</td>
                  <td>{resource.offering_name || DASH_ESCAPE_CODE}</td>
                  <td>
                    {resource.backend_id ? (
                      <span className="small text-success">
                        {resource.backend_id}
                      </span>
                    ) : (
                      <span className="text-muted">{translate('Not set')}</span>
                    )}
                  </td>
                  <td>
                    <Badge
                      bg={
                        resource.state === 'OK'
                          ? 'success'
                          : resource.state === 'Erred'
                            ? 'danger'
                            : 'secondary'
                      }
                    >
                      {resource.state}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Card.Body>
  </Card>
);
