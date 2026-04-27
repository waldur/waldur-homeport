import { Field, reduxForm } from 'redux-form';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { StringField } from '@/form';
import { REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { InvitationRoleFilter } from '@/invitations/InvitationRoleFilter';
import { InvitationScopeTypeFilter } from '@/invitations/InvitationScopeTypeFilter';
import { ROLE_TYPES } from '@/permissions/constants';
import { TableFilterItem } from '@/table/TableFilterItem';

export const UserAffiliationsFilter = reduxForm<any, {}>({
  form: 'UserAffiliationsFilter',
  touchOnChange: true,
  destroyOnUnmount: false,
})(() => {
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
      <TableFilterItem
        title={translate('Scope name')}
        name="scope_name"
        getValueLabel={(value) => value}
      >
        <Field
          name="scope_name"
          component={StringField}
          {...REACT_SELECT_TABLE_FILTER}
          placeholder={translate('Enter scope name')}
        />
      </TableFilterItem>
      <InvitationRoleFilter />
    </>
  );
});
