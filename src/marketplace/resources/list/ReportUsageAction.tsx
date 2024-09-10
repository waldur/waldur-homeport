import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { UsageReportContext } from '@waldur/marketplace/resources/usage/types';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { useValidators } from '@waldur/resource/actions/useValidators';
import { getUser } from '@waldur/workspace/selectors';

const ResourceCreateUsageDialog = lazyComponent(
  () => import('@waldur/marketplace/resources/usage/ResourceCreateUsageDialog'),
  'ResourceCreateUsageDialog',
);

const validators = [validateState('OK')];

export const ReportUsageAction = ({ resource }: { resource: Resource }) => {
  const dispatch = useDispatch();

  const callback = (props: UsageReportContext) => {
    dispatch(
      openModalDialog(ResourceCreateUsageDialog, {
        resolve: props,
      }),
    );
  };

  const user = useSelector(getUser);
  const canSetUsage = hasPermission(user, {
    permission: PermissionEnum.SET_RESOURCE_USAGE,
    customerId: resource.customer_uuid,
  });

  const { tooltip, disabled: isDisabledState } = useValidators(
    validators,
    resource as any,
  );
  const isDisabled = !resource.is_usage_based && !resource.is_limit_based;

  if (!canSetUsage && !user.is_staff) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Report usage')}
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
