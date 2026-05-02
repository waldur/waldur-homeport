import { FC } from 'react';
import { marketplaceProviderResourcesSetBackendId } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const SetBackendIdDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { backend_id: string }>({
    mutationFn: (formData) =>
      marketplaceProviderResourcesSetBackendId({
        path: { uuid: resource.uuid },
        body: formData,
      }),

    successMessage: translate('Backend ID has been successfully set.'),
    errorMessage: translate('Unable to set backend ID.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Set backend ID')}
      formFields={[
        {
          name: 'backend_id',
          label: translate('Backend ID'),
          required: true,
          type: 'string',
        },
      ]}
      initialValues={{
        backend_id: resource.backend_id,
      }}
      submitForm={mutation.mutateAsync}
    />
  );
};
