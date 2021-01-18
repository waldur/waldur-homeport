import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  changeFlavor,
  ChangeFlavorRequestBody,
  loadFlavors,
} from '@waldur/openstack/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { formatFlavor } from '@waldur/resource/utils';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { OpenStackInstanceCurrentFlavor } from '../OpenStackInstanceCurrentFlavor';

export const ChangeFlavorDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();

  const asyncState = useAsync(async () => {
    const flavors = await loadFlavors(resource.service_settings_uuid);
    return {
      flavors: flavors
        .filter((flavor) => flavor.name !== resource.flavor_name)
        .map((flavor) => ({
          label: `${flavor.name} (${formatFlavor(flavor)})`,
          value: flavor.url,
        })),
    };
  });

  const fields = asyncState.value
    ? [
        {
          name: 'currentFlavor',
          component: () => (
            <OpenStackInstanceCurrentFlavor context={{ resource }} />
          ),
        },
        {
          name: 'flavor',
          type: 'select',
          label: translate('New flavor'),
          options: asyncState.value.flavors,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Change flavor')}
      loading={asyncState.loading}
      error={asyncState.error}
      fields={fields}
      submitForm={async (formData: ChangeFlavorRequestBody) => {
        try {
          await changeFlavor(resource.uuid, formData);
          dispatch(showSuccess(translate('Flavor change has been scheduled.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to change flavor.')));
        }
      }}
    />
  );
};
