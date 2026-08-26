import { FC } from 'react';
import { vmwareDisksExtend } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const ExtendDiskDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { size: number }>({
    mutationFn: (formData) =>
      vmwareDisksExtend({
        path: { uuid: resource.uuid },
        body: { size: formData.size },
      }),

    successMessage: translate('Disk extension has been scheduled.'),
    errorMessage: translate('Unable to extend disk.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Extend disk')}
      dialogSubtitle={
        <ScopeSubtitle label={translate('Disk name')} name={resource.name} />
      }
      formFields={[
        {
          label: translate('Size'),
          type: 'integer',
        },
      ]}
      initialValues={{ size: resource.size }}
      submitForm={mutation.mutateAsync}
    />
  );
};
