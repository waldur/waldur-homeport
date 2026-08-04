import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import { rolesRetrieve, rolesUpdateDescriptionsUpdate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { getRoles } from './utils';

export const RoleDescriptionEditDialog = ({ resolve: { row, refetch } }) => {
  const { closeDialog } = useModal();
  const queryClient = useQueryClient();

  // The roles list response is trimmed and no longer carries the
  // `description_<lang>` translations this dialog edits. Fetch the full
  // role on open to populate the per-language fields.
  // skipGlobalErrorRedirect: a failure must surface inside the dialog rather
  // than navigate the whole app away.
  const {
    data: role,
    isLoading,
    isError,
    refetch: refetchRole,
  } = useQuery({
    queryKey: ['role-details', row.uuid],
    queryFn: () =>
      rolesRetrieve({ path: { uuid: row.uuid } }).then(
        (response) => response.data,
      ),
    meta: { skipGlobalErrorRedirect: true },
  });

  const onSubmit = async (formData) => {
    await rolesUpdateDescriptionsUpdate({
      path: { uuid: row.uuid },
      body: formData,
    });
    ENV.roles = await getRoles();
    queryClient.invalidateQueries({ queryKey: ['role-details', row.uuid] });
    closeDialog();
    refetch();
  };

  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        ENV.languageChoices.map(({ code }) => [
          `description_${code}`,
          role?.[`description_${code}`],
        ]),
      ),
    [ENV.languageChoices, role],
  );

  if (isLoading) {
    return (
      <ModalDialog title={translate('Edit name translations')}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  // Never render the (validator-free) form over descriptions we failed to
  // load — otherwise Save would submit empty strings and wipe every existing
  // translation for the role.
  if (isError) {
    return (
      <ModalDialog title={translate('Edit name translations')}>
        <LoadingErred
          loadData={refetchRole}
          message={translate('Unable to load role name translations.')}
        />
      </ModalDialog>
    );
  }

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit name translations')}
            footer={
              <>
                <CloseDialogButton label={translate('Cancel')} />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <p className="text-muted">
              {translate(
                'The name shown to users for this role, in each language. The role code is edited separately.',
              )}
            </p>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="table">
                <tbody>
                  {ENV.languageChoices.map(({ code, label }) => (
                    <tr key={code}>
                      <td className="align-middle fw-bold">{label}</td>
                      <td>
                        <Field name={`description_${code}`}>
                          {({ input, meta }) => (
                            <StringField
                              input={input}
                              meta={meta}
                              disabled={submitting}
                            />
                          )}
                        </Field>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
