import { FC } from 'react';
import { AgentIdentity } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface AgentIdentityExpandableRowProps {
  row: AgentIdentity;
}

const getStateBadgeVariant = (state: string) => {
  switch (state) {
    case 'Active':
      return 'success';
    case 'Idle':
      return 'warning';
    case 'Error':
      return 'danger';
    default:
      return 'default';
  }
};

export const AgentIdentityExpandableRow: FC<
  AgentIdentityExpandableRowProps
> = ({ row }) => {
  return (
    <ExpandableContainer>
      <div className="row">
        <div className="col-md-6">
          <h6 className="mb-3">{translate('Configuration')}</h6>
          {row.config_file_content ? (
            <pre
              className="bg-light p-3 rounded"
              style={{ maxHeight: '200px', overflow: 'auto' }}
            >
              {row.config_file_content}
            </pre>
          ) : (
            <p className="text-muted">
              {translate('No configuration content available')}
            </p>
          )}
          {row.dependencies &&
            Array.isArray(row.dependencies) &&
            row.dependencies.length > 0 && (
              <>
                <h6 className="mt-4 mb-2">{translate('Dependencies')}</h6>
                <ul className="list-unstyled text-muted mb-0">
                  {row.dependencies.map(
                    (
                      dep: { package?: string; version?: string } | string,
                      index: number,
                    ) => (
                      <li key={index}>
                        <code>
                          {typeof dep === 'string'
                            ? dep
                            : `${dep.package || 'unknown'}==${dep.version || 'unknown'}`}
                        </code>
                      </li>
                    ),
                  )}
                </ul>
              </>
            )}
        </div>
        <div className="col-md-6">
          <h6 className="mb-3">{translate('Services')}</h6>
          {row.services && row.services.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>{translate('Name')}</th>
                    <th>{translate('Mode')}</th>
                    <th>{translate('State')}</th>
                    <th>{translate('Created')}</th>
                  </tr>
                </thead>
                <tbody>
                  {row.services.map((service) => (
                    <tr key={service.uuid}>
                      <td>{service.name}</td>
                      <td>{service.mode || DASH_ESCAPE_CODE}</td>
                      <td>
                        <Badge
                          variant={getStateBadgeVariant(service.state)}
                          pill
                          outline
                        >
                          {service.state}
                        </Badge>
                      </td>
                      <td>{formatDateTime(service.created)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">{translate('No services registered')}</p>
          )}
        </div>
      </div>
    </ExpandableContainer>
  );
};
