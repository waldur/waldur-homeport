import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  InstanceFlavorChangeRequest,
  openstackInstancesChangeFlavor,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { loadFlavors } from '@/openstack/api';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { formatFlavor } from '@/resource/utils';
import { showSuccess, showErrorResponse } from '@/store/notify';

import { OpenStackInstanceCurrentFlavor } from '../OpenStackInstanceCurrentFlavor';

export const ChangeFlavorDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();

  const asyncState = useQuery({
    queryKey: ['flavors', resource.tenant_uuid, resource.flavor_name],
    queryFn: async () => {
      const flavors = await loadFlavors({
        tenant_uuid: resource.tenant_uuid,
        field: ['url', 'name', 'cores', 'ram'],
      });
      return {
        flavors: flavors
          .filter((flavor) => flavor.name !== resource.flavor_name)
          .map((flavor) => ({
            label: `${flavor.name} (${formatFlavor(flavor)})`,
            value: flavor.url,
          })),
      };
    },
    staleTime: UI_STALE_TIME,
  });

  const fields = asyncState.data
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
          options: asyncState.data.flavors,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Change flavor')}
      loading={asyncState.isLoading}
      error={asyncState.error}
      formFields={fields}
      submitForm={async (formData: InstanceFlavorChangeRequest) => {
        try {
          await openstackInstancesChangeFlavor({
            path: { uuid: resource.uuid },
            body: formData,
          });
          if (refetch) {
            await refetch();
          }
          dispatch(showSuccess(translate('Flavor change has been scheduled.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to change flavor.')));
        }
      }}
    />
  );
};
