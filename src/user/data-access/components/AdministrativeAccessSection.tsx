import { FC } from 'react';
import { Table } from 'react-bootstrap';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { Badge } from '@waldur/core/Badge';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { AdministrativeAccess, AccessType } from '../types';
import { formatAccessType, getAccessTypeBadgeVariant } from '../utils';

interface AdministrativeAccessSectionProps {
  data: AdministrativeAccess;
  isViewerStaffOrSupport: boolean;
}

export const AdministrativeAccessSection: FC<
  AdministrativeAccessSectionProps
> = ({ data, isViewerStaffOrSupport }) => (
  <AccordionCard
    title={translate('Administrative access')}
    subtitle={data.description}
    defaultOpen={false}
    className="mb-4"
  >
    {/* Counts are only available for staff/support viewers */}
    {data.staff_count !== undefined && data.support_count !== undefined && (
      <div className="d-flex gap-6 mb-4">
        <div>
          <span className="text-muted">{translate('Staff')}: </span>
          <strong>{data.staff_count}</strong>
        </div>
        <div>
          <span className="text-muted">{translate('Support')}: </span>
          <strong>{data.support_count}</strong>
        </div>
      </div>
    )}

    {isViewerStaffOrSupport && data.users && data.users.length > 0 && (
      <Table responsive hover className="mb-0">
        <thead>
          <tr>
            <th>{translate('User')}</th>
            <th>{translate('Access type')}</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((user) => (
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
                {user.access_type && (
                  <Badge
                    variant={getAccessTypeBadgeVariant(
                      user.access_type as AccessType,
                    )}
                    pill
                    outline
                  >
                    {formatAccessType(user.access_type as AccessType)}
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </AccordionCard>
);
