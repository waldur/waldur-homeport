import { FC } from 'react';

import { OpenStackInstance } from '../../types';

import { UpdateInternalIpsForm } from './UpdateInternalIpsForm';
import { useUpdateInternalIpsForm } from './utils';

export interface UpdateInternalIpsDialogProps {
  resolve: {
    resource: OpenStackInstance;
  };
}

export const UpdateInternalIpsDialog: FC<UpdateInternalIpsDialogProps> = ({
  resolve: { resource },
}) => {
  const formState = useUpdateInternalIpsForm(resource);
  return <UpdateInternalIpsForm {...formState} />;
};
