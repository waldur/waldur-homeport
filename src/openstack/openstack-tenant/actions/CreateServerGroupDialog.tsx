import { FC } from 'react';

import { OpenStackTenant } from '../types';

import { CreateServerGroupForm } from './CreateServerGroupForm';
import { useCreateServerGroupForm } from './utils';

interface CreateServerGroupDialogProps {
  resolve: {
    resource: OpenStackTenant;
    refetch?;
  };
}

export const CreateServerGroupDialog: FC<CreateServerGroupDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const formState = useCreateServerGroupForm(resource, refetch);
  return <CreateServerGroupForm {...formState} />;
};
