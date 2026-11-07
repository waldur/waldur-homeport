import { FC } from 'react';

import {
  AccordionCard,
  AlertItem,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

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
        className="mb-3"
      >
        <p className="text-quaternary mb-0">
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
    <div className="mb-3">
      <h5 className="mb-2.5">{translate('Service provider access')}</h5>
      <AlertItem
        type="floating"
        variant="info"
        className="mb-3"
        title={
          isViewerStaffOrSupport
            ? translate(
                'Service providers can only access the specific fields the user consented to when using their offerings.',
              )
            : translate(
                'Service providers can only access the specific fields you consented to when using their offerings.',
              )
        }
      />

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
          className="mb-2.5"
          secondary
        >
          <div className="mb-2.5">
            <div className="mb-1.5">{translate('Exposed fields')}</div>
            <div className="flex flex-wrap gap-1">
              {provider.exposed_fields.map((field) => (
                <Badge
                  key={field}
                  variant="secondary"
                  shape="pill"
                  tone="outline"
                >
                  {formatFieldName(field)}
                </Badge>
              ))}
            </div>
          </div>

          {(provider.consent_date || provider.consent_version) && (
            <div className="flex gap-3 text-quaternary small">
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
              <div className="mt-3">
                <div className="mb-1.5">
                  {translate('Provider team members')}
                </div>
                <Table density="compact" className="mb-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{translate('User')}</TableHead>
                      <TableHead>{translate('Role')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {provider.provider_team.map((user) => (
                      <TableRow key={user.user_uuid}>
                        <TableCell>
                          <Link
                            state="support-user-manage"
                            params={{ user_uuid: user.user_uuid }}
                          >
                            {user.full_name || user.username}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {user.role ? (
                            <Badge variant="info" shape="pill" tone="outline">
                              {user.role}
                            </Badge>
                          ) : (
                            <span className="text-quaternary">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
        </AccordionCard>
      ))}
    </div>
  );
};
