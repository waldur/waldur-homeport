import { useCallback, useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { INVITATION_CREATE_FORM_ID } from '../constants';
import { useInvitationCreateDialog } from '../hooks';
import { EmailInviteUser, InvitationContext } from '../types';

import { BulkUpload } from './BulkUpload';
import { CustomMessageInput } from './CustomMessageInput';
import { CustomMessageWrapper } from './CustomMessageWrapper';
import { EmailsListGroupWrapper } from './EmailsListGroupWrapper';
import { FinishStepWrapper } from './FinishStepWrapper';
import { FormButtons } from './FormButtons';
import { SendingStatus } from './SendingStatus';

import './InvitationCreateDialog.scss';

interface OwnProps {
  resolve: { context: InvitationContext };
}

export const InvitationCreateDialog = reduxForm<{}, OwnProps>({
  form: INVITATION_CREATE_FORM_ID,
  enableReinitialize: true,
  initialValues: { users: [{}] },
})(
  ({
    resolve: { context },
    submitting,
    handleSubmit,
    change,
    reset,
    valid,
  }) => {
    const {
      createInvitations,
      creationResult,
      finish,
      roles,
      defaultRoleAndProject,
      fetchUserDetailsCallback,
      fetchingUserDetails,
      usersDetails,
    } = useInvitationCreateDialog(context);
    const getRoles = () => {
      if (context.project) {
        return roles.slice(1);
      }
      return roles;
    };

    const [step, setStep] = useState<1 | 2 | 3>(1);

    const populateUserItems = useCallback(
      (items: Array<{ email: string }>) => {
        const users: EmailInviteUser[] = [];
        items.forEach((item) => {
          users.push({
            email: item.email,
            role_project: defaultRoleAndProject.role?.value
              ? {
                  role: defaultRoleAndProject.role.value,
                  project: defaultRoleAndProject.project,
                }
              : undefined,
          });
        });
        change('users', users);
      },
      [change, context.project],
    );

    const resetForm = () => {
      setStep(1);
      reset();
    };

    const submit = useCallback(
      (formData) => {
        return createInvitations(formData).then(() => setStep(3));
      },
      [createInvitations, setStep],
    );

    const disabled = submitting || fetchingUserDetails;

    return (
      <form
        onSubmit={handleSubmit(submit)}
        className="invitation-create-dialog"
      >
        <Modal.Body className="p-12">
          <Row>
            <Col md={12} lg={8} className="d-flex flex-column">
              <div className="flex-grow-1 min-h-400px">
                {step === 1 ? (
                  <EmailsListGroupWrapper
                    roles={getRoles()}
                    customer={context.customer}
                    project={context.project}
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
            ></Col>
            <Col className="my-auto pb-20">
              {step === 1 ? (
                <BulkUpload onImport={populateUserItems} />
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
  },
);
