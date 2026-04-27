import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { lexisLinksCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

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

      await lexisLinksCreate({ body: { resource: resource_url } });
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
        footer={<FormFooter submitting={props.submitting} />}
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
