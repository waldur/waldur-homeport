import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const ResourceShowUsageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceShowUsageDialog" */ '@waldur/marketplace/resources/usage/ResourceShowUsageDialog'
    ),
  'ResourceShowUsageDialog',
);

export const ShowUsageAction = ({ resource }: { resource: Resource }) => {
  const dispatch = useDispatch();
  const callback = (resource) => {
    dispatch(
      openModalDialog(ResourceShowUsageDialog, {
        resolve: {
          resource,
        },
        size: 'lg',
      }),
    );
  };
  return (
    <ActionItem
      title={translate('Show usage')}
      action={() =>
        callback({
          ...resource,
          offering_uuid:
            resource.offering_uuid || resource.marketplace_offering_uuid,
          resource_uuid: resource.uuid || resource.marketplace_resource_uuid,
        })
      }
    />
  );
};
