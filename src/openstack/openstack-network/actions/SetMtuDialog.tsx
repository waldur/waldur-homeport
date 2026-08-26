import { FC } from 'react';
import { openstackNetworksSetMtu } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const SetMtuDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { mtu: number }>({
    mutationFn: (formData) =>
      openstackNetworksSetMtu({
        path: { uuid: resource.uuid },
        body: { mtu: formData.mtu },
      }),

    successMessage: translate('Network MTU has been updated.'),
    errorMessage: translate('Unable to update network MTU.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Set MTU')}
      dialogSubtitle={
        <ScopeSubtitle label={translate('Network name')} name={resource.name} />
      }
      formFields={[
        {
          name: 'mtu',
          type: 'integer',
          label: translate('MTU'),
          minValue: 68,
          maxValue: 65536,
        },
      ]}
      initialValues={{
        mtu: resource.mtu,
      }}
      submitForm={mutation.mutateAsync}
    />
  );
};
