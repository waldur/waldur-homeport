import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { addRemoteUser } from './api';

export const AddRemoteUserDialog = ({ resolve: { refreshList } }) => {
  const dispatch = useDispatch();
  const context = {
    provider: ENV.plugins.WALDUR_AUTH_SOCIAL.EDUTEAMS_LABEL,
  };
  return (
    <ResourceActionDialog
      dialogTitle={translate('Add {provider} user', context)}
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
          dispatch(
            showSuccess(
              translate(
                '{provider} user has been successfully added.',
                context,
              ),
            ),
          );
          if (refreshList) {
            await refreshList();
          }
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to add {provider} user.', context),
            ),
          );
        }
      }}
    />
  );
};
