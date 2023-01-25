import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { createDisk } from '../api';

export const CreateDiskDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create disk')}
      formFields={[
        {
          label: translate('Size'),
          type: 'integer',
        },
      ]}
      submitForm={async (formData) => {
        try {
          await createDisk(resource.uuid, formData.size);
          dispatch(showSuccess(translate('Disk has been created.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to create disk.')));
        }
      }}
    />
  );
};
