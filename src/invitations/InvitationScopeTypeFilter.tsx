import { translate } from '@/i18n';
import { ROLE_TYPES } from '@/permissions/constants';
import { SelectFilter } from '@/table';

export const InvitationScopeTypeFilter = (props) => (
  <SelectFilter
    title={translate('Scope type')}
    name="scope_type"
    badgeValue={(value) => value?.label || value?.value}
    options={props.options || ROLE_TYPES}
    isClearable={true}
  />
);
