import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { createLexisLink } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const CreateLexisLinkDialog = reduxForm<
  {},
  { resolve: { resource; refetch } }
>({
  form: 'CreateLexisLinkDialog',
})((props) => {
  const resource = props.resolve.resource;
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      const resource_url = `${ENV.apiEndpoint}api/marketplace-resources/${resource.marketplace_resource_uuid}/`;

      await createLexisLink({ resource: resource_url });
      dispatch(
        showSuccess(
          translate('LEXIS link creation request has been submitted.'),
        ),
      );
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to submit LEXIS link creation request.'),
        ),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(callback)}>
      <ModalDialog
        title={translate('Create LEXIS Link for the resource {resourceName}', {
          resourceName: resource.name,
        })}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={props.submitting}
              label={translate('Submit')}
              className="btn btn-primary"
            />
          </>
        }
      >
        {translate(
          'Are you sure you would like to create a LEXIS link for the resource {resourceName}?',
          {
            resourceName: resource.name,
          },
        )}
      </ModalDialog>
    </form>
  );
});
