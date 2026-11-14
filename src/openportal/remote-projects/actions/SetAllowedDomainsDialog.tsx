import { Form } from 'react-final-form';
import {
  RemoteProject,
  openportalRemoteProjectsSetAllowedDomains,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { BooleanGroup, CommaSeparatedListGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormValues {
  restricted: boolean;
  allowed_domains?: string[];
}

interface SetAllowedDomainsDialogProps {
  row: RemoteProject;
  resolve: {
    refetch: () => Promise<void> | void;
  };
}

/**
 * allowed_domains has three states: null admits anyone, an empty list admits
 * nobody, and a list admits only what is on it. The switch picks between the
 * first and the other two, so lifting the restriction sends null rather than
 * an empty list that would lock everyone out.
 */
const toAllowedDomains = (values: FormValues): string[] | null =>
  values.restricted ? (values.allowed_domains ?? []) : null;

export const SetAllowedDomainsDialog: React.FC<
  SetAllowedDomainsDialogProps
> = ({ row, resolve }) => {
  // Only null means unrestricted. A row without the field (not fetched)
  // must not start unrestricted, or saving would silently lift a
  // restriction: it starts restricted, and cannot be saved.
  const current = row.allowed_domains;
  const known = current !== undefined;

  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      openportalRemoteProjectsSetAllowedDomains({
        path: { uuid: row.uuid },
        body: { allowed_domains: toAllowedDomains(values) },
      }),
    successMessage: translate('Allowed domains have been updated.'),
    errorMessage: translate('Unable to update allowed domains.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={{
        restricted: current !== null,
        allowed_domains: current ?? [],
      }}
      subscription={{ submitting: true, invalid: true, values: true }}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Set allowed domains')}
            footer={
              <SubmitButton
                submitting={submitting}
                invalid={invalid}
                disabled={!known}
                disabledReason={
                  known
                    ? undefined
                    : translate('The current allowed domains are not known.')
                }
                label={translate('Save')}
              />
            }
          >
            {!known && (
              <AlertItem
                type="floating"
                variant="warning"
                className="mb-3"
                title={translate(
                  'The current allowed domains could not be loaded, so they cannot be changed here.',
                )}
              />
            )}
            <BooleanGroup
              name="restricted"
              label={translate('Restrict who may join')}
              description={translate(
                'When off, anyone may join the project, whatever their email address.',
              )}
            />
            {values.restricted && (
              <CommaSeparatedListGroup
                name="allowed_domains"
                label={translate('Allowed email domain patterns')}
                description={translate(
                  'e.g. *.ac.uk. An empty list means no domains are allowed to join.',
                )}
                placeholder={translate('*.example.com, user@example.org')}
              />
            )}
            {values.restricted && !values.allowed_domains?.length && (
              <AlertItem
                type="floating"
                variant="warning"
                title={translate('Nobody will be able to join.')}
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
