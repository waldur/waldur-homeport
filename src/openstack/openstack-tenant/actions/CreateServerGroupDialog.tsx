import { FC } from 'react';

import { OpenStackTenant } from '../types';

import { CreateServerGroupForm } from './CreateServerGroupForm';
import { useCreateServerGroupForm } from './utils';

export interface CreateServerGroupDialogProps {
  resolve: {
    resource: OpenStackTenant;
  };
}

export const CreateServerGroupDialog: FC<CreateServerGroupDialogProps> = ({
  resolve: { resource },
}) => {
  const formState = useCreateServerGroupForm(resource);
  return <CreateServerGroupForm {...formState} />;
};
