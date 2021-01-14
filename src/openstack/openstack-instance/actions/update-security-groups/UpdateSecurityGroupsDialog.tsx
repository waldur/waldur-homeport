import { FC } from 'react';

import { OpenStackInstance } from '../../types';

import { UpdateSecurityGroupsForm } from './UpdateSecurityGroupsForm';
import { useUpdateSecurityGroupsForm } from './utils';

export interface UpdateSecurityGroupsDialogProps {
  resolve: {
    resource: OpenStackInstance;
  };
}

export const UpdateSecurityGroupsDialog: FC<UpdateSecurityGroupsDialogProps> = ({
  resolve: { resource },
}) => {
  const formState = useUpdateSecurityGroupsForm(resource);
  return <UpdateSecurityGroupsForm {...formState} />;
};
