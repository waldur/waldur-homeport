import { FC } from 'react';
import { vmwareVirtualMachineCreateDisk } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const CreateDiskDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { size: number }>({
    mutationFn: (formData) =>
      vmwareVirtualMachineCreateDisk({
        path: { uuid: resource.uuid },
        body: { size: formData.size },
      }),

    successMessage: translate('Disk has been created.'),
    errorMessage: translate('Unable to create disk.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create disk')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Virtual machine name')}
          name={resource.name}
        />
      }
      formFields={[
        {
          label: translate('Size'),
          type: 'integer',
        },
      ]}
      submitForm={mutation.mutateAsync}
    />
  );
};
