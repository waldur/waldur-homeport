import { useSelector } from 'react-redux';

import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures, InvitationsFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@/workspace/selectors';

export const useTeamTableTabs = () => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);

  return [
    isOwnerOrStaff && {
      key: 'users',
      title: translate('Active'),
      state: 'organization-users',
    },
    {
      key: 'organization-invitations',
      title: translate('Invitations'),
      state: 'organization-invitations',
    },
    !ENV.plugins.WALDUR_CORE.INVITATION_USE_WEBHOOKS && {
      key: 'organization-group-invitations',
      title: translate('Group invitations'),
      state: 'organization-group-invitations',
    },
    isFeatureVisible(CustomerFeatures.show_permission_reviews) && {
      key: 'organization-permissions-reviews',
      title: translate('Reviews'),
      state: 'organization-permissions-reviews',
    },
    isFeatureVisible(InvitationsFeatures.show_service_accounts) && {
      key: 'organization-service-accounts',
      title: translate('Service accounts'),
      state: 'organization-service-accounts',
    },
  ].filter(Boolean);
};
