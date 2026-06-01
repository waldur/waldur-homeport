import { FunctionComponent } from 'react';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { Role } from '@/permissions/types';

export const RoleGroup: FunctionComponent<{ roles: Role[]; disabled }> = ({
  roles,
  disabled,
}) => (
  <SelectGroup
    name="role"
    validate={required}
    options={roles}
    getOptionLabel={(item) => item.description || item.name}
    getOptionValue={(item) => item.uuid}
    isDisabled={disabled}
    label={translate('Role')}
    description={translate(
      'For public invitations, only project-level roles can be selected.',
    )}
    required
  />
);
