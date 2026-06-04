import { translate } from '@/i18n';
import { roleAutocomplete } from '@/permissions/utils';
import { AsyncSelectFilter } from '@/table';

export const InvitationRoleFilter = () => (
  <AsyncSelectFilter
    title={translate('Role')}
    name="role"
    badgeValue={(value) => value?.description || value?.name}
    placeholder={translate('Select role...')}
    loadOptions={roleAutocomplete}
    getOptionValue={(option) => option.uuid}
    getOptionLabel={(option) => option.description || option.name}
    isClearable={true}
  />
);
