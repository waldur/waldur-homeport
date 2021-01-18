import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { setNetworkMtu } from '@waldur/openstack/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const SetMtuDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Set MTU')}
      fields={[
        {
          name: 'mtu',
          type: 'integer',
          label: translate('MTU'),
          minValue: 68,
          maxValue: 65536,
        },
      ]}
      initialValues={{
        mtu: resource.mtu,
      }}
      submitForm={async (formData) => {
        try {
          await setNetworkMtu(resource.uuid, formData.mtu);
          dispatch(showSuccess(translate('Network MTU has been updated.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to update network MTU.')),
          );
        }
      }}
    />
  );
};
