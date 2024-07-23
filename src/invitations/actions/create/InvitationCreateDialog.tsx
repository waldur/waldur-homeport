import { useCallback, useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { INVITATION_CREATE_FORM_ID } from '../constants';
import { useInvitationCreateDialog } from '../hooks';
import { GroupInviteRow, InvitationContext } from '../types';

import { BulkUpload, EmailRolePairs } from './BulkUpload';
import { CustomMessageInput } from './CustomMessageInput';
import { CustomMessageWrapper } from './CustomMessageWrapper';
import { EmailsListGroupWrapper } from './EmailsListGroupWrapper';
import { FinishStepWrapper } from './FinishStepWrapper';
import { FormButtons } from './FormButtons';
import { SendingStatus } from './SendingStatus';

import './InvitationCreateDialog.scss';

interface OwnProps {
  resolve: InvitationContext;
}

export const InvitationCreateDialog = reduxForm<{}, OwnProps>({
  form: INVITATION_CREATE_FORM_ID,
  enableReinitialize: false,
  initialValues: { rows: [{}] },
})(({ resolve, submitting, handleSubmit, change, reset, valid }) => {
  const {
    createInvitations,
    creationResult,
    finish,
    roles,
    defaultRole,
    defaultProject,
    fetchUserDetailsCallback,
    fetchingUserDetails,
    usersDetails,
  } = useInvitationCreateDialog(resolve);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const populateRows = useCallback(
    (items: EmailRolePairs) => {
      const rows: GroupInviteRow[] = [];
      items.forEach((item) => {
        const role = item.role
          ? roles.find(
              (role) =>
                role.name.toLocaleLowerCase() ===
                  item.role.toLocaleLowerCase() ||
                role.description.toLocaleLowerCase() ===
                  item.role.toLocaleLowerCase(),
            )
          : defaultRole;
        const project = item.project
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
      });
      change('rows', rows);
    },
    [change, defaultRole, defaultProject, roles],
  );

  const resetForm = () => {
    setStep(1);
    reset();
  };

  const submit = useCallback(
    (formData) => createInvitations(formData).then(() => setStep(3)),
    [createInvitations, setStep],
  );

  const disabled = submitting || fetchingUserDetails;

  return (
    <form onSubmit={handleSubmit(submit)} className="invitation-create-dialog">
      <Modal.Body className="p-12">
        <Row>
          <Col md={12} lg={8} className="d-flex flex-column">
            <div className="flex-grow-1 min-h-400px">
              {step === 1 ? (
                <EmailsListGroupWrapper
                  roles={roles}
                  customer={resolve.customer}
                  project={resolve.project}
                  fetchUserDetails={fetchUserDetailsCallback}
                  usersDetails={usersDetails}
                  disabled={disabled}
                />
              ) : step === 2 ? (
                <CustomMessageWrapper />
              ) : step === 3 ? (
                <FinishStepWrapper />
              ) : null}
            </div>
            <div className="align-self-end mt-4">
              <FormButtons
                setStep={setStep}
                step={step}
                submitting={submitting}
                reset={resetForm}
                finish={finish}
                valid={valid}
              />
            </div>
          </Col>
          <Col
            xs="auto"
            className="border-end border-gray-300 border-2 mx-5 p-0"
          />
          <Col className="my-auto pb-20">
            {step === 1 && resolve.enableBulkUpload ? (
              <BulkUpload onImport={populateRows} />
            ) : step === 2 ? (
              <CustomMessageInput />
            ) : step === 3 ? (
              <SendingStatus result={creationResult} />
            ) : null}
          </Col>
        </Row>
      </Modal.Body>
    </form>
  );
});
