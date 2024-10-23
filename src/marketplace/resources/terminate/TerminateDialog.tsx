import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { SubmitButton } from '@waldur/form';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { terminateResource } from '@waldur/marketplace/common/api';
import { orderCanBeApproved as orderCanBeApprovedSelector } from '@waldur/marketplace/orders/actions/selectors';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import TenantSubtitle from '@waldur/openstack/openstack-tenant/actions/DestroyActionSubtitle.md';
import ClusterSubtitle from '@waldur/rancher/cluster/actions/DestroyActionSubtitle.md';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const TerminateDialog = reduxForm<
  {},
  { resolve: { resource; refetch } }
>({
  form: 'TerminateResourceDialog',
})((props) => {
  const orderCanBeApproved = useSelector(orderCanBeApprovedSelector);
  const resource = props.resolve.resource;
  const dialogSubtitle =
    resource.resource_type === 'OpenStack.Tenant'
      ? TenantSubtitle
      : resource.resource_type === 'Rancher.Cluster'
        ? ClusterSubtitle
        : null;

  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await terminateResource(resource.marketplace_resource_uuid);
      dispatch(
        showSuccess(
          translate('Resource termination request has been submitted.'),
        ),
      );
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to submit resource termination request.'),
        ),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(callback)}>
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
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={props.submitting}
              label={
                orderCanBeApproved
                  ? translate('Submit')
                  : translate('Request for a termination')
              }
              className="btn btn-danger"
            />
          </>
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
        {dialogSubtitle && <FormattedHtml html={dialogSubtitle} />}
      </ModalDialog>
    </form>
  );
});
