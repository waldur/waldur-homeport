import { reduxForm } from 'redux-form';
import { lexisLinksCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const CreateLexisLinkDialog = reduxForm<
  {},
  { resolve: { resource; refetch } }
>({
  form: 'CreateLexisLinkDialog',
})((props) => {
  const resource = props.resolve.resource;
  const createLinkMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const resource_url = `${ENV.apiEndpoint}api/marketplace-resources/${resource.marketplace_resource_uuid}/`;
      return lexisLinksCreate({ body: { resource: resource_url } });
    },
    successMessage: translate(
      'LEXIS link creation request has been submitted.',
    ),
    errorMessage: translate('Unable to submit LEXIS link creation request.'),
    refetch: props.resolve.refetch,
  });

  return (
    <form onSubmit={props.handleSubmit(() => createLinkMutation.mutateAsync())}>
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
