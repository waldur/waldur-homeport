import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { slurmJobsCreate } from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@/core/api';
import { FileUploadField } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const SubmitJobDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
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
      submitForm={async (formData) => {
        try {
          await slurmJobsCreate({
            body: {
              name: 'job',
              file: fileSerializer(formData.file),
              project: resource.project,
              service_settings: resource.service_settings,
            },
            ...formDataOptions,
          });
          dispatch(showSuccess(translate('Job has been submitted.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to submit job.')));
        }
      }}
    />
  );
};
