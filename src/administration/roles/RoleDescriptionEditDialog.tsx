import { useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import { rolesUpdateDescriptionsUpdate } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { StringField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { getRoles } from './utils';

export const RoleDescriptionEditDialog = ({ resolve: { row, refetch } }) => {
  const { closeDialog } = useModal();
  const onSubmit = async (formData) => {
    await rolesUpdateDescriptionsUpdate({
      path: { uuid: row.uuid },
      body: formData,
    });
    ENV.roles = await getRoles();
    closeDialog();
    refetch();
  };

  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        ENV.languageChoices.map(({ code }) => [
          `description_${code}`,
          row[`description_${code}`],
        ]),
      ),
    [ENV.languageChoices, row],
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit role description')}
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
            closeButton
          >
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="table">
                <tbody>
                  {ENV.languageChoices.map(({ code, label }) => (
                    <tr key={code}>
                      <td className="align-middle fw-bold">{label}</td>
                      <td>
                        <Field
                          name={`description_${code}`}
                          component={StringField as any}
                          className="form-control"
                          disabled={submitting}
                        />
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
