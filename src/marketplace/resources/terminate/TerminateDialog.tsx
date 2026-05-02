import { useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplaceResourcesTerminate } from 'waldur-js-client';

import { FormFooter } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';
import { orderCanBeApproved as orderCanBeApprovedSelector } from '@/marketplace/orders/actions/selectors';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ReactComponent as TenantSubtitle } from '@/openstack/openstack-tenant/actions/DestroyActionSubtitle.md';
import { ReactComponent as ClusterSubtitle } from '@/rancher/cluster/actions/DestroyActionSubtitle.md';

export const TerminateDialog = reduxForm<
  {},
  { resolve: { resource; refetch } }
>({
  form: 'TerminateResourceDialog',
})((props) => {
  const orderCanBeApproved = useSelector(orderCanBeApprovedSelector);
  const resource = props.resolve.resource;
  const dialogSubtitle =
    resource.resource_type === 'OpenStack.Tenant' ? (
      <TenantSubtitle />
    ) : resource.resource_type === 'Rancher.Cluster' ? (
      <ClusterSubtitle />
    ) : null;

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
    refetch: props.resolve.refetch,
  });

  return (
    <form onSubmit={props.handleSubmit(() => mutation.mutateAsync())}>
      <ModalDialog
        title={translate(
          'Terminate resource {resourceName} from {projectName} ({customerName})',
          {
            resourceName: resource.name,
            projectName: resource.project_name,
            customerName: resource.customer_name,
          },
        )}
        footer={
          <FormFooter
            submitting={props.submitting}
            submitLabel={
              orderCanBeApproved
                ? translate('Submit')
                : translate('Request for a termination')
            }
            submitVariant="danger"
          />
        }
      >
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
      </ModalDialog>
    </form>
  );
});
