import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { updateOfferingUser } from '../common/api';
import { ServiceProvider } from '../types';

import { OfferingUser } from './types';

export const ProviderOfferingUserUpdateDialog: FC<{
  resolve: { row: OfferingUser; refetch(): void; provider: ServiceProvider };
}> = ({ resolve: { row, provider, refetch } }) => {
  const dispatch = useDispatch();

  const fields = [
    {
      name: 'username',
      type: 'string',
      required: true,
      label: translate('External username'),
    },
  ];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Link OpenStack Instance')}
      formFields={fields}
      initialValues={{ username: row.username }}
      submitForm={async (formData) => {
        try {
          await updateOfferingUser(
            provider.uuid,
            row.user_uuid,
            formData.username,
          );
          dispatch(showSuccess(translate('Username has been updated.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to update username.')),
          );
        }
      }}
    />
  );
};
