import { At, MapPinLine, PhoneCall, UserSquare } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { isStaffOrSupport } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { formatUserIsActive } from '../support/utils';

export const UserProfile = ({
  user,
  className,
}: {
  user: UserDetails;
  className?: string;
}) => {
  const showStatus = useSelector(isStaffOrSupport);
  const abbreviation = useMemo(
    () => getItemAbbreviation(user, 'full_name'),
    [user],
  );
  return (
    <PublicDashboardHero2
      hideQuickSection
      logo={user.image}
      logoAlt={abbreviation}
      logoCircle
      cardBordered
      className={className}
      title={
        <div className="d-flex gap-4">
          <h3 className="h-45px mb-0">{user.full_name}</h3>
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
      <Stack direction="horizontal" className="flex-wrap text-grey-500" gap={5}>
        {user.job_title && (
          <span className="text-nowrap">
            <UserSquare size={18} weight="duotone" className="me-1" />
            {user.job_title}
          </span>
        )}
        {user.organization && (
          <span className="text-nowrap">
            <MapPinLine size={18} weight="duotone" className="me-1" />
            {user.organization}
          </span>
        )}
        {user.email && (
          <span className="text-nowrap">
            <At size={18} weight="duotone" className="me-1" />
            {user.email}
          </span>
        )}
        {user.phone_number && (
          <span className="text-nowrap">
            <PhoneCall size={18} weight="duotone" className="me-1" />
            {user.phone_number}
          </span>
        )}
      </Stack>
    </PublicDashboardHero2>
  );
};
