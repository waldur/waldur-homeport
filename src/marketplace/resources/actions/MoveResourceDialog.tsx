import { reduxForm } from 'redux-form';
import { marketplaceResourcesMoveResource, Resource } from 'waldur-js-client';

import { FormContainer, FormFooter } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { MOVE_RESOURCE_FORM_ID } from './constants';
import { MoveToProjectAutocomplete } from './MoveToProjectAutocomplete';

interface MoveResourceDialogOwnProps {
  resolve: {
    resource: Resource & { marketplace_resource_uuid: string };
    refetch?(): void;
  };
}

interface FormData {
  project: { name: string; customer_name: string; url: string };
}

export const MoveResourceDialog = reduxForm<
  FormData,
  MoveResourceDialogOwnProps
>({
  form: MOVE_RESOURCE_FORM_ID,
})((props) => {
  const { showSuccess } = useNotify();

  const submitRequestMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      marketplaceResourcesMoveResource({
        path: { uuid: props.resolve.resource.marketplace_resource_uuid },
        body: {
          project: {
            url: formData.project.url,
          },
        },
      }),
    errorMessage: translate('Unable to move resource.'),
    refetch: props.resolve.refetch,
    onSuccess: (_data, formData) => {
      showSuccess(
        translate(
          '{resourceName} resource has been moved to {projectName} project.',
          {
            resourceName: props.resolve.resource.name,
            projectName: formData.project.name,
          },
        ),
      );
    },
  });

  return (
    <form
      onSubmit={props.handleSubmit((values: FormData) =>
        submitRequestMutation.mutateAsync(values),
      )}
    >
      <ModalDialog
        title={translate(
          'Move resource {resourceName} from {projectName} ({customerName})',
          {
            resourceName: props.resolve.resource.name,
            projectName: props.resolve.resource.project_name,
            customerName: props.resolve.resource.customer_name,
          },
        )}
        footer={
          <FormFooter
            submitting={props.submitting}
            invalid={props.invalid}
            submitLabel={translate('Save')}
          />
        }
      >
        <FormContainer submitting={props.submitting}>
          <MoveToProjectAutocomplete isDisabled={props.submitting} />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
