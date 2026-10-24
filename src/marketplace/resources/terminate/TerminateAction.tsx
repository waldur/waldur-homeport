import { XCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplaceResourcesTerminate } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { checkOrderCanBeApproved } from '@/marketplace/orders/actions/selectors';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { TenantDestroySubtitle } from '@/openstack/openstack-tenant/actions/TenantDestroySubtitle';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ClusterDestroySubtitle } from '@/rancher/cluster/actions/ClusterDestroySubtitle';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { useValidators } from '@/resource/actions/useValidators';
import { useCustomer, useProject, useUser } from '@/workspace/hooks';

import { ResourceAction } from '../actions/constants';

const validators = [validateState('OK', 'ERRED', 'Erred')];

/** What terminating takes with it, for the types where that is more than
 * the resource itself. */
const getTerminateSubtitle = (resourceType: string) => {
  if (resourceType === 'OpenStack.Tenant') {
    return <TenantDestroySubtitle />;
  }
  if (resourceType === 'Rancher.Cluster') {
    return <ClusterDestroySubtitle />;
  }
  return null;
};

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
  const customer = useCustomer();
  const project = useProject();
  const orderCanBeApproved = checkOrderCanBeApproved(user, customer, project);

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
          {getTerminateSubtitle(resource.resource_type)}
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
      important
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
