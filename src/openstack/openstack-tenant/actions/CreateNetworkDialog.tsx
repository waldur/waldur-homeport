import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackTenantsCreateNetwork } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import {
  createLatinNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const CreateNetworkDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create network for OpenStack tenant')}
      formFields={[createLatinNameField(), createDescriptionField()]}
      submitForm={async (formData) => {
        try {
          await openstackTenantsCreateNetwork({
            path: { uuid: resource.uuid },
            body: formData,
          });
          dispatch(
            showSuccess(translate('OpenStack networks has been created.')),
          );
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to create OpenStack networks.'),
            ),
          );
        }
      }}
    />
  );
};
