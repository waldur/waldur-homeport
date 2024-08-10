import { FunctionComponent } from 'react';

import { UserDetails } from '@waldur/workspace/types';

interface OwnProps {
  tabSpec;
  user: UserDetails;
  isPersonal?: boolean;
}

export const UserManage: FunctionComponent<OwnProps> = ({
  tabSpec,
  user,
  isPersonal,
}) => {
  if (tabSpec) {
    return (
      <tabSpec.component user={user} showDeleteButton={!isPersonal} hasHeader />
    );
  }
  return null;
};
