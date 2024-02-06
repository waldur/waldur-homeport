import { FunctionComponent } from 'react';

import { Invitation } from './types';

export const RoleField: FunctionComponent<{ invitation: Invitation }> = ({
  invitation,
}) => <>{invitation.role_description}</>;
