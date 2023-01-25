import { FC } from 'react';

import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';

import { FloatingIpsForm } from './FloatingIpsForm';
import { useFloatingIpsEditor } from './utils';

export interface UpdateFloatingIpsDialogProps {
  resolve: {
    resource: OpenStackInstance;
    refetch?(): void;
  };
}

export const UpdateFloatingIpsDialog: FC<UpdateFloatingIpsDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const editorState = useFloatingIpsEditor(resource, refetch);
  return <FloatingIpsForm {...editorState} />;
};
