import { FunctionComponent, useMemo } from 'react';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { Role } from '@/permissions/types';
import {
  formatRoleLabel,
  getAmbiguousRoleDescriptions,
} from '@/permissions/utils';

export const RoleGroup: FunctionComponent<{ roles: Role[]; disabled }> = ({
  roles,
  disabled,
}) => {
  const ambiguous = useMemo(() => getAmbiguousRoleDescriptions(roles), [roles]);
  return (
    <SelectGroup
      name="role"
      validate={required}
      options={roles}
      getOptionLabel={(item) => formatRoleLabel(item, ambiguous)}
      getOptionValue={(item) => item.uuid}
      isDisabled={disabled}
      label={translate('Role')}
      description={translate(
        'For public invitations, only project-level roles can be selected.',
      )}
      required
    />
  );
};
