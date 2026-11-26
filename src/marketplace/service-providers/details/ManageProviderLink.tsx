import { GearSixIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import {
  checkCanAccessServiceProvider,
  checkIsStaffOrSupport,
  getUser,
} from '@/workspace/selectors';
import { User } from '@/workspace/types';

/**
 * Whether the user may open the provider workspace of the organization
 * `customerUuid`: the same rule as the workspace's route guard, for that
 * organization rather than the one open in the store.
 */
export const canManageProvider = (
  user: User | undefined,
  customerUuid: string,
): boolean =>
  !!user &&
  (checkIsStaffOrSupport(user) ||
    checkCanAccessServiceProvider({ uuid: customerUuid }, user));

/** On the public profile: the way into the provider's own workspace. */
export const ManageProviderLink: FC<{ customerUuid: string }> = ({
  customerUuid,
}) => {
  const user = useSelector(getUser);
  if (!canManageProvider(user, customerUuid)) {
    return null;
  }
  return (
    <Link
      state="marketplace-provider-dashboard"
      params={{ uuid: customerUuid }}
      buttonVariant="tertiary"
      buttonSize="lg"
      data-testid="manage-service-provider"
    >
      <GearSixIcon weight="bold" size={20} />
      {translate('Manage service provider')}
    </Link>
  );
};
