import { useDispatch } from 'react-redux';
import { remoteEduteams } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@/store/notify';

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
          await remoteEduteams({ body: { cuid: formData.cuid } });
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
