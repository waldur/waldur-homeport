import { FC } from 'react';

import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';

import { FloatingIpsForm } from './FloatingIpsForm';
import { useFloatingIpsEditor } from './utils';

export interface UpdateFloatingIpsDialogProps {
  resolve: {
    resource: OpenStackInstance;
  };
}

export const UpdateFloatingIpsDialog: FC<UpdateFloatingIpsDialogProps> = ({
  resolve: { resource },
}) => {
  const editorState = useFloatingIpsEditor(resource);
  return <FloatingIpsForm {...editorState} />;
};
