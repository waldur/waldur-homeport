import { FC } from 'react';

import { OpenStackTenant } from '../types';

import { CreateSecurityGroupForm } from './CreateSecurityGroupForm';
import { useCreateSecurityGroupForm } from './utils';

export interface CreateSecurityGroupDialogProps {
  resolve: {
    resource: OpenStackTenant;
  };
}

export const CreateSecurityGroupDialog: FC<CreateSecurityGroupDialogProps> = ({
  resolve: { resource },
}) => {
  const formState = useCreateSecurityGroupForm(resource);
  return <CreateSecurityGroupForm {...formState} />;
};
