import { UserListIcon } from '@phosphor-icons/react';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { UsageReportContext } from '@/marketplace/resources/usage/types';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { useValidators } from '@/resource/actions/useValidators';
import { useUser } from '@/workspace/hooks';

import { ResourceAction } from '../actions/constants';

const ResourceCreateUsageDialog = lazyComponent(() =>
  import('@/marketplace/resources/usage/ResourceCreateUsageDialog').then(
    (module) => ({ default: module.ResourceCreateUsageDialog }),
  ),
);

const validators = [validateState('OK')];

export const ReportUserUsageAction = ({ resource }: { resource: Resource }) => {
  const { openDialog } = useModal();

  const callback = (props: UsageReportContext) => {
    openDialog(ResourceCreateUsageDialog, {
      resolve: { ...props, userUsage: true },
    });
  };

  const user = useUser();
  const canSetUsage = hasPermission(user, {
    permission: PermissionEnum.SET_RESOURCE_USAGE,
    customerId: resource.provider_uuid,
  });

  const { tooltip, disabled: isDisabledState } = useValidators(
    validators,
    resource as any,
  );
  const isDisabled = !resource.is_usage_based && !resource.is_limit_based;

  const spCanCreateOfferingUser = (resource.offering_plugin_options as any)
    ?.service_provider_can_create_offering_user;

  if (!spCanCreateOfferingUser) {
    return null;
  }
  if (!user.is_staff && !canSetUsage) {
    return null;
  }

  return (
    <ActionItem
      title={translate('User usage report')}
      iconNode={<UserListIcon weight="bold" />}
      action={() =>
        callback({
          offering_uuid: resource.offering_uuid,
          resource_uuid: resource.uuid,
          resource_name: resource.name,
          customer_name: resource.customer_name,
          project_name: resource.project_name,
          backend_id: resource.backend_id,
        })
      }
      actionId={ResourceAction.REPORT_USAGE}
      resource={resource}
      disabled={isDisabled || isDisabledState}
      tooltip={[
        isDisabled &&
          translate('The resource is not based on usage or limitations.'),
        tooltip,
      ]
        .filter(Boolean)
        .join(' | ')}
    />
  );
};
