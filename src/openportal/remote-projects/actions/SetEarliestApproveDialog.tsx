import { Form } from 'react-final-form';
import {
  RemoteProject,
  openportalRemoteProjectsSetEarliestApprove,
} from 'waldur-js-client';

import { DateTimeGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormValues {
  earliest_approve: string | null;
}

interface SetEarliestApproveDialogProps {
  row: RemoteProject;
  resolve: {
    refetch: () => Promise<void> | void;
  };
}

export const SetEarliestApproveDialog: React.FC<
  SetEarliestApproveDialogProps
> = ({ row, resolve }) => {
  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      openportalRemoteProjectsSetEarliestApprove({
        path: { uuid: row.uuid },
        body: { earliest_approve: values.earliest_approve || null },
      }),
    successMessage: translate('Earliest approve time has been updated.'),
    errorMessage: translate('Unable to update earliest approve time.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={{ earliest_approve: row.earliest_approve ?? null }}
      subscription={{ submitting: true, invalid: true }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Set earliest approve time')}
            footer={
              <SubmitButton
                submitting={submitting}
                invalid={invalid}
                label={translate('Save')}
              />
            }
          >
            <DateTimeGroup
              name="earliest_approve"
              label={translate('Earliest approve time (UTC)')}
              description={translate(
                'The earliest time this award may be approved on the receiving portal. Leave empty to allow approval at any time.',
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
