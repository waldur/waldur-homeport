import { FC } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { InvitationRoleFilter } from '@/invitations/InvitationRoleFilter';
import { InvitationScopeTypeFilter } from '@/invitations/InvitationScopeTypeFilter';
import { ROLE_TYPES } from '@/permissions/constants';
import { SelectFilter, StringFilter } from '@/table';

const getRoleStatusFilterOptions = () => [
  {
    label: translate('Active only'),
    value: '',
  },
  {
    label: translate('Include revoked'),
    value: true,
  },
];

interface UserAffiliationsFilterProps {
  showRoleStatus?: boolean;
}

export const UserAffiliationsFilter: FC<UserAffiliationsFilterProps> = ({
  showRoleStatus,
}) => {
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
        placeholder={translate('Enter scope name')}
      />
      <InvitationRoleFilter />
      {showRoleStatus && (
        <SelectFilter
          title={translate('Role status')}
          name="show_inactive"
          badgeValue={(value) =>
            getRoleStatusFilterOptions().find((op) => op.value === value)?.label
          }
          ellipsis={false}
          className="Select"
          placeholder={translate('Select role status')}
          options={getRoleStatusFilterOptions()}
          noUpdateOnBlur={true}
          simpleValue={true}
          isClearable={true}
        />
      )}
    </>
  );
};
