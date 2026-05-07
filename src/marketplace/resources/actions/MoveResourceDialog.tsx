import { Form } from 'react-final-form';
import { marketplaceResourcesMoveResource, Resource } from 'waldur-js-client';

import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

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

export const MoveResourceDialog = (props: MoveResourceDialogOwnProps) => {
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
    <Form
      onSubmit={(values: FormData) => submitRequestMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
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
                submitting={submitting}
                invalid={invalid}
                submitLabel={translate('Save')}
              />
            }
          >
            <MoveToProjectAutocomplete isDisabled={submitting} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
