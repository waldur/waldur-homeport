import { FunctionComponent } from 'react';

import { formatRole } from '@waldur/permissions/utils';

import { Invitation } from './types';

export const RoleField: FunctionComponent<{ invitation: Invitation }> = ({
  invitation,
}) => <>{formatRole(invitation.role_name)}</>;
