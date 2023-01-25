import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { FileUploadField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { submitJob } from '@waldur/slurm/api';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

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
          await submitJob({
            name: 'job',
            file: formData.file,
            project: resource.project,
            service_settings: resource.service_settings,
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
