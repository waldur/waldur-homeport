import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { extendDisk } from '../api';

export const ExtendDiskDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Extend disk')}
      formFields={[
        {
          label: translate('Size'),
          type: 'integer',
        },
      ]}
      initialValues={{ size: resource.size }}
      submitForm={async (formData) => {
        try {
          await extendDisk(resource.uuid, formData.size);
          dispatch(
            showSuccess(translate('Disk extension has been scheduled.')),
          );
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to extend disk.')));
        }
      }}
    />
  );
};
