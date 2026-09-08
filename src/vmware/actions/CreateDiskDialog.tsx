import { FC } from 'react';
import { vmwareVirtualMachineCreateDisk } from 'waldur-js-client';

import { greaterThan, required } from '@/core/validators';
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
        // The API takes megabytes, the rest of the VMware UI speaks gigabytes.
        body: { size: Number(formData.size) * 1024 },
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
          name: 'size',
          label: translate('Size'),
          type: 'integer',
          unit: translate('GB'),
          required: true,
          minValue: 1,
          validate: [required, greaterThan(0)],
        },
      ]}
      submitForm={mutation.mutateAsync}
    />
  );
};
