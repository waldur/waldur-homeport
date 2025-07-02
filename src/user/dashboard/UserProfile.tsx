import {
  AtIcon,
  MapPinLineIcon,
  PhoneCallIcon,
  UserSquareIcon,
} from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { User } from 'waldur-js-client';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { formatUserIsActive } from '../support/utils';

export const UserProfile = ({
  user,
  className,
}: {
  user: User;
  className?: string;
}) => {
  const showStatus = useSelector(isStaffOrSupport);
  const abbreviation = useMemo(
    () => getItemAbbreviation(user, 'full_name'),
    [user],
  );
  return (
    <PublicDashboardHero
      hideQuickSection
      logo={user.image}
      logoAlt={abbreviation}
      logoCircle
      cardBordered
      className={className}
      title={
        <div className="d-flex flex-wrap gap-4 mb-3">
          <h3 className="mb-0">{user.full_name}</h3>
          {(showStatus || user.is_staff || user.is_support) && (
            <div>
              <StateIndicator
                label={formatUserIsActive(user)}
                variant={user.is_active ? 'success' : 'danger'}
                outline
                pill
                hasBullet
              />
            </div>
          )}
        </div>
      }
    >
      <Stack
        direction="horizontal"
        className="flex-wrap text-gray-500 lh-1"
        gap={5}
      >
        {user.job_title && (
          <span className="text-nowrap">
            <UserSquareIcon size={18} weight="duotone" className="me-1" />
            {user.job_title}
          </span>
        )}
        {user.organization && (
          <span className="text-nowrap">
            <MapPinLineIcon size={18} weight="duotone" className="me-1" />
            {user.organization}
          </span>
        )}
        {user.email && (
          <span className="text-nowrap">
            <AtIcon size={18} weight="duotone" className="me-1" />
            {user.email}
          </span>
        )}
        {user.phone_number && (
          <span className="text-nowrap">
            <PhoneCallIcon size={18} weight="duotone" className="me-1" />
            {user.phone_number}
          </span>
        )}
      </Stack>
    </PublicDashboardHero>
  );
};
