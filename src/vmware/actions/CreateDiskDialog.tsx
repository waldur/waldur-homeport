import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { createDisk } from '../api';

export const CreateDiskDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create disk')}
      fields={[
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
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to create disk.')));
        }
      }}
    />
  );
};
