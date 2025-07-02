import { useCallback, useState } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { INVITATION_CREATE_FORM_ID } from '../constants';
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

export const InvitationCreateDialog = reduxForm<{}, OwnProps>({
  form: INVITATION_CREATE_FORM_ID,
  enableReinitialize: false,
  initialValues: { rows: [{}] },
})(({ resolve, submitting, handleSubmit, change, valid }) => {
  const { createInvitations, finish, roles, defaultRole, defaultProject } =
    useInvitationCreateDialog(resolve);

  const [step, setStep] = useState<1 | 2>(1);

  const populateRows = useCallback(
    (items: EmailRolePairs) => {
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
              ? resolve.customer.projects.find(
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
    [change, defaultRole, defaultProject, roles],
  );

  const submit = useCallback(
    (formData) => createInvitations(formData).then(() => finish()),
    [createInvitations, setStep],
  );

  const disabled = submitting;

  return (
    <form onSubmit={handleSubmit(submit)} className="invitation-create-dialog">
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
          <BulkUpload onImport={populateRows} />
        ) : null}
        <div className="min-h-400px">
          {step === 1 ? (
            <EmailsListGroupWrapper
              roles={roles}
              customer={resolve.customer}
              project={resolve.project}
              disabled={disabled}
            />
          ) : step === 2 ? (
            <CustomMessageWrapper />
          ) : null}
        </div>
      </ModalDialog>
    </form>
  );
});
