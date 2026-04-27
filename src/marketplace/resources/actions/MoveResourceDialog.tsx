import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplaceResourcesMoveResource, Resource } from 'waldur-js-client';

import { FormContainer, FormFooter } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
  const dispatch = useDispatch();

  const submitRequest = async (formData: FormData) => {
    try {
      await marketplaceResourcesMoveResource({
        path: { uuid: props.resolve.resource.marketplace_resource_uuid },
        body: {
          project: {
            url: formData.project.url,
          },
        },
      });
      dispatch(
        showSuccess(
          translate(
            '{resourceName} resource has been moved to {projectName} project.',
            {
              resourceName: props.resolve.resource.name,
              projectName: formData.project.name,
            },
          ),
        ),
      );
      if (props.resolve.refetch) {
        await props.resolve.refetch();
      }
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to move resource.')));
    }
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
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
