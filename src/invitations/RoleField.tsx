import { FunctionComponent } from 'react';

import { RolePopover } from '@waldur/user/affiliations/RolePopover';

import { Invitation } from './types';

export const RoleField: FunctionComponent<{ invitation: Invitation }> = ({
  invitation,
}) => <RolePopover roleName={invitation.role_name} />;
