import { FC } from 'react';
import { slurmJobsCreate } from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@/core/api';
import { FileUploadField } from '@/form';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const SubmitJobDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { file: File }>({
    mutationFn: (formData) =>
      slurmJobsCreate({
        body: {
          name: 'job',
          file: fileSerializer(formData.file),
          project: resource.project,
          service_settings: resource.service_settings,
        },
        ...formDataOptions,
      }),

    successMessage: translate('Job has been submitted.'),
    errorMessage: translate('Unable to submit job.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Submit job')}
      formFields={[
        {
          name: 'file',
          label: translate('Batch script file'),
          component: FileUploadField,
        },
      ]}
      submitForm={mutation.mutateAsync}
    />
  );
};
