import { ChartPieIcon } from '@phosphor-icons/react';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { ResourceAction } from '../actions/constants';

const ResourceShowUsageDialog = lazyComponent(() =>
  import('@/marketplace/resources/usage/ResourceShowUsageDialog').then(
    (module) => ({ default: module.ResourceShowUsageDialog }),
  ),
);

export const ShowUsageAction = ({ resource }: { resource: Resource }) => {
  const { openDialog } = useModal();
  const callback = (resource) => {
    openDialog(ResourceShowUsageDialog, {
      resolve: {
        resource,
      },
      size: 'lg',
    });
  };
  const isDisabled = !resource.is_usage_based && !resource.is_limit_based;
  return (
    <ActionItem
      title={translate('Show usage')}
      iconNode={<ChartPieIcon weight="bold" />}
      actionId={ResourceAction.SHOW_USAGE}
      resource={resource}
      action={() =>
        callback({
          ...resource,
          offering_uuid:
            resource['marketplace_offering_uuid'] || resource.offering_uuid,
          resource_uuid: resource['marketplace_resource_uuid'] || resource.uuid,
        })
      }
      disabled={isDisabled}
      tooltip={
        isDisabled &&
        translate('The resource is not based on usage or limitations.')
      }
    />
  );
};
