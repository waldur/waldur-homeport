import { FC } from 'react';

import {
  AccordionCard,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';

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
    className="mb-3"
  >
    {/* Counts are only available for staff/support viewers */}
    {data.staff_count !== undefined && data.support_count !== undefined && (
      <div className="flex gap-5 mb-3">
        <div>
          <span className="text-quaternary">{translate('Staff')}: </span>
          <strong>{data.staff_count}</strong>
        </div>
        <div>
          <span className="text-quaternary">{translate('Support')}: </span>
          <strong>{data.support_count}</strong>
        </div>
      </div>
    )}

    {isViewerStaffOrSupport && data.users && data.users.length > 0 && (
      <Table className="mb-0">
        <TableHeader>
          <TableRow>
            <TableHead>{translate('User')}</TableHead>
            <TableHead>{translate('Access type')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.users.map((user) => (
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
                {user.access_type && (
                  <Badge
                    variant={getAccessTypeBadgeVariant(
                      user.access_type as AccessType,
                    )}
                    shape="pill"
                    tone="outline"
                  >
                    {formatAccessType(user.access_type as AccessType)}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </AccordionCard>
);
