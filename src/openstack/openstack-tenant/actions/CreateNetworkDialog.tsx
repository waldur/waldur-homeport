import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { createNetwork } from '../../api';

export const CreateNetworkDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create network for OpenStack tenant')}
      fields={[createLatinNameField(), createDescriptionField()]}
      submitForm={async (formData) => {
        try {
          await createNetwork(resource.uuid, formData);
          dispatch(
            showSuccess(translate('OpenStack networks has been created.')),
          );
          dispatch(closeModalDialog());
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
