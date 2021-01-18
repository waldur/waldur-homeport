import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { changeFlavor, loadFlavors } from '@waldur/openstack/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { formatFlavor } from '@waldur/resource/utils';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { OpenStackInstanceCurrentFlavor } from '../OpenStackInstanceCurrentFlavor';

function flavorFormatter(flavor) {
  const props = formatFlavor(flavor);
  return `${flavor.name} (${props})`;
}

function formatFlavorChoices(choices, resource) {
  return choices
    .filter((choice) => choice.name !== resource.flavor_name)
    .map((flavor) => ({
      label: flavorFormatter(flavor),
      value: flavor.url,
    }));
}

export const ChangeFlavorDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();

  const asyncState = useAsync(async () => {
    const flavors = await loadFlavors(resource.service_settings_uuid);
    return {
      flavors: formatFlavorChoices(flavors, resource),
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
      fields={fields}
      submitForm={async (formData) => {
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
