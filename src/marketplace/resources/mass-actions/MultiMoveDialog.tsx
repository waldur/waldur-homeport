import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplaceResourcesMoveResource, Resource } from 'waldur-js-client';

import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useBatchMutation } from '@/modal/useBatchMutation';

import { MoveToProjectAutocomplete } from '../actions/MoveToProjectAutocomplete';

interface FormData {
  project: { name: string; customer_name: string; url: string };
}

interface MultiMoveDialogProps {
  resolve: {
    rows: Resource[];
    refetch?(): void;
  };
}

export const MultiMoveDialog: FC<MultiMoveDialogProps> = (props) => {
  const moveMutation = useBatchMutation<Resource, FormData>({
    rows: props.resolve.rows,
    mutationFn: (resource, variables) =>
      marketplaceResourcesMoveResource({
        path: { uuid: resource.uuid },
        body: {
          project: {
            url: variables.project.url,
          },
        },
      }),
    successMessage: translate('Resources are moved.'),
    errorMessage: translate('Unable to move resources.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form<FormData>
      onSubmit={(formData) => moveMutation.mutate(formData)}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Mass move resources')}
            footer={<FormFooter submitLabel={translate('Save')} />}
          >
            <MoveToProjectAutocomplete />
          </ModalDialog>
        </form>
      )}
    />
  );
};
