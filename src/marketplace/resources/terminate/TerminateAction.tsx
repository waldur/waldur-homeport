import { XCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { marketplaceResourcesTerminate } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { orderCanBeApproved as orderCanBeApprovedSelector } from '@/marketplace/orders/actions/selectors';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ReactComponent as TenantSubtitle } from '@/openstack/openstack-tenant/actions/DestroyActionSubtitle.md';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ReactComponent as ClusterSubtitle } from '@/rancher/cluster/actions/DestroyActionSubtitle.md';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { useValidators } from '@/resource/actions/useValidators';
import { useUser } from '@/workspace/hooks';

import { ResourceAction } from '../actions/constants';

const validators = [validateState('OK', 'ERRED', 'Erred')];

interface TerminateActionProps {
  resource: any;
  refetch?(): void;
}

export const TerminateAction: FC<TerminateActionProps> = ({
  resource,
  refetch,
}) => {
  const user = useUser();
  const { tooltip, disabled } = useValidators(validators, resource);

  const orderCanBeApproved = useSelector(orderCanBeApprovedSelector);

  const dialogSubtitle = useMemo(() => {
    if (resource.resource_type === 'OpenStack.Tenant') {
      return <TenantSubtitle />;
    }
    if (resource.resource_type === 'Rancher.Cluster') {
      return <ClusterSubtitle />;
    }
    return null;
  }, [resource.resource_type]);

  const mutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceResourcesTerminate({
        path: { uuid: resource.marketplace_resource_uuid },
        body: {
          attributes: {
            accepting_terms_of_service: true,
          },
        },
      }),
    successMessage: translate(
      'Resource termination request has been submitted.',
    ),
    errorMessage: translate('Unable to submit resource termination request.'),
    refetch,
    confirmation: {
      title: translate(
        'Terminate resource {resourceName} from {projectName} ({customerName})',
        {
          resourceName: resource.name,
          projectName: resource.project_name,
          customerName: resource.customer_name,
        },
      ),
      body: (
        <>
          {translate(
            'Are you sure you would like to terminate resource {resourceName} from project {projectName} ({customerName})?',
            {
              resourceName: <strong>{resource.name}</strong>,
              projectName: <strong>{resource.project_name}</strong>,
              customerName: <strong>{resource.customer_name}</strong>,
            },
            formatJsxTemplate,
          )}
          {dialogSubtitle}
        </>
      ),
      options: {
        type: 'danger',
        positiveButton: orderCanBeApproved
          ? translate('Submit')
          : translate('Request for a termination'),
        positiveButtonVariant: 'danger',
      },
    },
  });

  if (
    !hasPermission(user, {
      permission: PermissionEnum.TERMINATE_RESOURCE,
      projectId: resource.project_uuid,
      customerId: resource.customer_uuid,
    })
  ) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Terminate')}
      action={() => mutation.mutate()}
      tooltip={tooltip}
      disabled={disabled}
      className="text-danger"
      actionId={ResourceAction.TERMINATE}
      resource={resource}
      iconNode={<XCircleIcon weight="bold" />}
      iconColor="danger"
    />
  );
};
