import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { addRemoteUser } from './api';

export const AddRemoteUserDialog = ({ resolve: { refetch } }) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Add user')}
      formFields={[
        {
          name: 'cuid',
          label: translate('Remote user ID'),
          required: true,
          type: 'string',
        },
      ]}
      submitForm={async (formData) => {
        try {
          await addRemoteUser(formData.cuid);
          dispatch(showSuccess(translate('User has been successfully added.')));
          if (refetch) {
            await refetch();
          }
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to add user.')));
        }
      }}
    />
  );
};
