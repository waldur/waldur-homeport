import { reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { InvitationRoleFilter } from '@waldur/invitations/InvitationRoleFilter';
import { InvitationScopeTypeFilter } from '@waldur/invitations/InvitationScopeTypeFilter';
import { InvitationStateFilter } from '@waldur/invitations/InvitationStateFilter';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureInvitationsFilter = () => (
  <>
    <InvitationStateFilter />
    <InvitationRoleFilter />
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
    <InvitationScopeTypeFilter />
  </>
);

const enhance = reduxForm({
  form: 'AdminInvitationsFilter',
  destroyOnUnmount: false,
});

export const InvitationsFilter = enhance(PureInvitationsFilter);
