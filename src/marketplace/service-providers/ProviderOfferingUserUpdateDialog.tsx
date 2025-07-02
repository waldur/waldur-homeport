import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOfferingUsersPartialUpdate } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { ServiceProvider } from '../types';

import { OfferingUser } from './types';

export interface ProviderOfferingUserUpdateDialogProps {
  resolve: {
    row: OfferingUser;
    refetch(): void;
    provider: ServiceProvider;
  };
}

export const ProviderOfferingUserUpdateDialog: FC<
  ProviderOfferingUserUpdateDialogProps
> = ({ resolve: { row, refetch } }) => {
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
      dialogTitle={translate('Set external username')}
      formFields={fields}
      initialValues={{ username: row.username }}
      submitForm={async (formData) => {
        try {
          await marketplaceOfferingUsersPartialUpdate({
            path: { uuid: row.uuid },
            body: {
              username: formData.username,
            },
          });
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
