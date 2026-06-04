import { FC } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { InvitationRoleFilter } from '@/invitations/InvitationRoleFilter';
import { InvitationScopeTypeFilter } from '@/invitations/InvitationScopeTypeFilter';
import { ROLE_TYPES } from '@/permissions/constants';
import { StringFilter } from '@/table';

export const UserAffiliationsFilter: FC = () => {
  const hideCallScope = !isFeatureVisible(
    MarketplaceFeatures.show_call_management_functionality,
  );
  const SCOPE_TYPE_OPTIONS = hideCallScope
    ? ROLE_TYPES.filter(
        (type) =>
          type.value !== 'call' &&
          type.value !== 'call_organizer' &&
          type.value !== 'proposal',
      )
    : ROLE_TYPES;

  return (
    <>
      <InvitationScopeTypeFilter options={SCOPE_TYPE_OPTIONS} />
      <StringFilter
        title={translate('Scope name')}
        name="scope_name"
        getValueLabel={(value) => value}
        variant="tableFilter"
        placeholder={translate('Enter scope name')}
      />
      <InvitationRoleFilter />
    </>
  );
};
