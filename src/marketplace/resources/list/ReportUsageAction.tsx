import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { UsageReportContext } from '@waldur/marketplace/resources/usage/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isSupportOnly as isSupportOnlySelector } from '@waldur/workspace/selectors';

const ResourceCreateUsageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceCreateUsageDialog" */ '@waldur/marketplace/resources/usage/ResourceCreateUsageDialog'
    ),
  'ResourceCreateUsageDialog',
);

export const ReportUsageAction = ({ resource }: { resource: Resource }) => {
  const dispatch = useDispatch();
  const isSupportOnly = useSelector(isSupportOnlySelector);

  const callback = (props: UsageReportContext) => {
    dispatch(
      openModalDialog(ResourceCreateUsageDialog, {
        resolve: props,
      }),
    );
  };

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
      disabled={
        (!resource.is_usage_based && !resource.is_limit_based) ||
        (isSupportOnly &&
          ['OK', 'Updating', 'Terminating'].includes(resource.state))
      }
    />
  );
};
