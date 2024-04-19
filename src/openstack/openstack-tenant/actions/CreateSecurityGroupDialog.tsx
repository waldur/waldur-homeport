import { FC } from 'react';

import { CreateSecurityGroupForm } from './CreateSecurityGroupForm';
import { TenantActionProps } from './types';
import { useCreateSecurityGroupForm } from './utils';

interface CreateSecurityGroupDialogProps {
  resolve: TenantActionProps;
}

export const CreateSecurityGroupDialog: FC<CreateSecurityGroupDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const formState = useCreateSecurityGroupForm(resource, refetch);
  return <CreateSecurityGroupForm {...formState} />;
};
