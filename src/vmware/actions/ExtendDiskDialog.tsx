import { FC } from 'react';
import { vmwareDisksExtend } from 'waldur-js-client';

import { formatFilesize } from '@/core/utils';
import { greaterThan, required } from '@/core/validators';
import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const ExtendDiskDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  // The API takes megabytes, the rest of the VMware UI speaks gigabytes.
  const currentSizeGb = Math.round(resource.size / 1024);

  const mutation = useManagedMutation<any, any, { size: number }>({
    mutationFn: (formData) =>
      vmwareDisksExtend({
        path: { uuid: resource.uuid },
        body: { size: Number(formData.size) * 1024 },
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
          name: 'size',
          label: translate('New size'),
          type: 'integer',
          unit: translate('GB'),
          required: true,
          minValue: currentSizeGb + 1,
          validate: [required, greaterThan(currentSizeGb)],
          help_text: translate('Current size: {size}', {
            size: formatFilesize(resource.size),
          }),
        },
      ]}
      initialValues={{ size: currentSizeGb + 1 }}
      submitForm={mutation.mutateAsync}
    />
  );
};
