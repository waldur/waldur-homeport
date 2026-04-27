import { FC } from 'react';
import { Alert, Table } from 'react-bootstrap';

import { AccordionCard } from '@/core/AccordionCard';
import { Badge } from '@/core/Badge';
import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';

import { ServiceProviderAccess } from '../types';
import { formatFieldName } from '../utils';

interface ServiceProviderAccessSectionProps {
  providers: ServiceProviderAccess[];
  isViewerStaffOrSupport: boolean;
}

export const ServiceProviderAccessSection: FC<
  ServiceProviderAccessSectionProps
> = ({ providers, isViewerStaffOrSupport }) => {
  if (providers.length === 0) {
    return (
      <AccordionCard
        title={translate('Service provider access')}
        defaultOpen={false}
        className="mb-4"
      >
        <p className="text-muted mb-0">
          {isViewerStaffOrSupport
            ? translate(
                'No service provider access. This user has not consented to share data with any service providers.',
              )
            : translate(
                'No service provider access. You have not consented to share data with any service providers.',
              )}
        </p>
      </AccordionCard>
    );
  }

  return (
    <div className="mb-4">
      <h5 className="mb-3">{translate('Service provider access')}</h5>
      <Alert variant="info" className="mb-4">
        {isViewerStaffOrSupport
          ? translate(
              'Service providers can only access the specific fields the user consented to when using their offerings.',
            )
          : translate(
              'Service providers can only access the specific fields you consented to when using their offerings.',
            )}
      </Alert>

      {providers.map((provider) => (
        <AccordionCard
          key={provider.offering_uuid}
          title={provider.offering_name}
          subtitle={
            provider.provider_name
              ? `${translate('Provided by')}: ${provider.provider_name}`
              : undefined
          }
          defaultOpen={false}
          className="mb-3"
          secondary
        >
          <div className="mb-3">
            <div className="fw-semibold mb-2">
              {translate('Exposed fields')}
            </div>
            <div className="d-flex flex-wrap gap-1">
              {provider.exposed_fields.map((field) => (
                <Badge key={field} variant="secondary" pill outline>
                  {formatFieldName(field)}
                </Badge>
              ))}
            </div>
          </div>

          {(provider.consent_date || provider.consent_version) && (
            <div className="d-flex gap-4 text-muted small">
              {provider.consent_date && (
                <span>
                  {translate('Consent given')}:{' '}
                  {formatDate(provider.consent_date)}
                </span>
              )}
              {provider.consent_version && (
                <span>
                  {translate('Version')}: {provider.consent_version}
                </span>
              )}
            </div>
          )}

          {isViewerStaffOrSupport &&
            provider.provider_team &&
            provider.provider_team.length > 0 && (
              <div className="mt-4">
                <div className="fw-semibold mb-2">
                  {translate('Provider team members')}
                </div>
                <Table responsive hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>{translate('User')}</th>
                      <th>{translate('Role')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provider.provider_team.map((user) => (
                      <tr key={user.user_uuid}>
                        <td>
                          <Link
                            state="admin-user-users.details"
                            params={{ user_uuid: user.user_uuid }}
                          >
                            {user.full_name || user.username}
                          </Link>
                        </td>
                        <td>
                          {user.role ? (
                            <Badge variant="info" pill outline>
                              {user.role}
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
        </AccordionCard>
      ))}
    </div>
  );
};
