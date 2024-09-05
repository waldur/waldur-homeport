import { FC } from 'react';

import { OpenStackInstance } from '../../types';

import { UpdateInternalIpsForm } from './UpdateInternalIpsForm';
import { useUpdatePortsForm } from './utils';

interface UpdateInternalIpsDialogProps {
  resolve: {
    resource: OpenStackInstance;
    refetch?;
  };
}

export const UpdateInternalIpsDialog: FC<UpdateInternalIpsDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const formState = useUpdatePortsForm(resource, refetch);
  return <UpdateInternalIpsForm {...formState} />;
};
