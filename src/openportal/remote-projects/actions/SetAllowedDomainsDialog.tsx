import { Form } from 'react-final-form';
import {
  RemoteProject,
  openportalRemoteProjectsSetAllowedDomains,
} from 'waldur-js-client';

import { CommaSeparatedListGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormValues {
  allowed_domains: string[];
}

interface SetAllowedDomainsDialogProps {
  row: RemoteProject;
  resolve: {
    refetch: () => Promise<void> | void;
  };
}

export const SetAllowedDomainsDialog: React.FC<
  SetAllowedDomainsDialogProps
> = ({ row, resolve }) => {
  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      openportalRemoteProjectsSetAllowedDomains({
        path: { uuid: row.uuid },
        body: { allowed_domains: values.allowed_domains ?? [] },
      }),
    successMessage: translate('Allowed domains have been updated.'),
    errorMessage: translate('Unable to update allowed domains.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={{ allowed_domains: row.allowed_domains ?? [] }}
      subscription={{ submitting: true, invalid: true }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Set allowed domains')}
            footer={
              <SubmitButton
                submitting={submitting}
                invalid={invalid}
                label={translate('Save')}
              />
            }
          >
            <CommaSeparatedListGroup
              name="allowed_domains"
              label={translate('Allowed email domain patterns')}
              description={translate(
                'e.g. *.ac.uk. An empty list means no domains are allowed to join.',
              )}
              placeholder={translate('*.example.com, user@example.org')}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
