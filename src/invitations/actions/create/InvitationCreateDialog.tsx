import arrayMutators from 'final-form-arrays';
import { useCallback, useState } from 'react';
import { Form } from 'react-final-form';

import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { GroupInviteRow, InvitationContext } from '../types';
import { useInvitationCreateDialog } from '../useInvitationCreateDialog';

import { BulkUpload, EmailRolePairs } from './BulkUpload';
import { CustomMessageWrapper } from './CustomMessageWrapper';
import { EmailsListGroupWrapper } from './EmailsListGroupWrapper';
import { FormButtons } from './FormButtons';

import './InvitationCreateDialog.scss';

interface OwnProps {
  resolve: InvitationContext;
}

const initialValues = { rows: [{}] };

export const InvitationCreateDialog = ({ resolve }: OwnProps) => {
  const { createInvitations, finish, roles, defaultRole, defaultProject } =
    useInvitationCreateDialog(resolve);

  const [step, setStep] = useState<1 | 2>(1);

  const submit = useCallback(
    (formData) => createInvitations(formData).then(() => finish()),
    [createInvitations, finish],
  );

  const populateRows = useCallback(
    (items: EmailRolePairs, change: (field: string, value: any) => void) => {
      const rows: GroupInviteRow[] = [];
      items.forEach((item) => {
        if (item.role === '') {
          rows.push({
            email: item.email,
            role_project: null,
          });
        } else {
          const role = item.role
            ? roles.find(
                (role) =>
                  role.name.toLocaleLowerCase() ===
                    item.role.toLocaleLowerCase() ||
                  role.description.toLocaleLowerCase() ===
                    item.role.toLocaleLowerCase(),
              )
            : defaultRole;
          const project =
            item.project && resolve.roleTypes.includes('customer')
              ? resolve.customer.projects?.find(
                  (project) =>
                    project.name.toLocaleLowerCase() ===
                      item.project.toLocaleLowerCase() ||
                    project.uuid.toLocaleLowerCase() ===
                      item.project.toLocaleLowerCase(),
                )
              : defaultProject;
          rows.push({
            email: item.email,
            role_project: { role, project },
          });
        }
      });
      change('rows', rows);
    },
    [defaultRole, defaultProject, roles],
  );

  return (
    <Form
      onSubmit={submit}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, valid, form }) => (
        <form onSubmit={handleSubmit} className="invitation-create-dialog">
          <ModalDialog
            title={translate('Invite by email')}
            subtitle={translate(
              "We'll email them instructions and a link to accept the invitation.",
            )}
            footer={
              <FormButtons
                setStep={setStep}
                step={step}
                submitting={submitting}
                valid={valid}
              />
            }
          >
            {step === 1 && resolve.enableBulkUpload ? (
              <BulkUpload
                onImport={(items) => populateRows(items, form.change)}
              />
            ) : null}
            <div>
              {step === 1 ? (
                <EmailsListGroupWrapper
                  roles={roles}
                  customer={resolve.customer}
                  project={resolve.project}
                  disabled={submitting}
                />
              ) : step === 2 ? (
                <CustomMessageWrapper />
              ) : null}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
