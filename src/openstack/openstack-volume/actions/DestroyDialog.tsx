import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { terminateResource } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const DestroyDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Destroy {name} volume', {
        name: resource.name,
      })}
      submitForm={async () => {
        try {
          await terminateResource(resource.marketplace_resource_uuid);
          dispatch(
            showSuccess(translate('Volume deletion has been scheduled.')),
          );
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to delete volume.')));
        }
      }}
    />
  );
};
