import { FC } from 'react';
import { marketplaceResourcesTerminate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { DestroyInstanceParams } from '@/openstack/api';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

import { getDeleteField } from './utils';

export const ForceDestroyDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, DestroyInstanceParams>({
    mutationFn: (formData) =>
      marketplaceResourcesTerminate({
        path: { uuid: resource.marketplace_resource_uuid },
        body: {
          attributes: { action: 'force_destroy', ...formData },
        },
      }),
    successMessage: translate('Instance deletion has been scheduled.'),
    errorMessage: translate('Unable to destroy instance.'),
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Force destroy {name} instance', {
        name: resource.name,
      })}
      {...getDeleteField()}
      submitForm={mutation.mutateAsync}
    />
  );
};
