import { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getFormSyncErrors } from 'redux-form';

import { FloatingSubmitButton } from '@waldur/form/FloatingSubmitButton';
import { Form } from '@waldur/form/Form';
import { FormSteps } from '@waldur/form/FormSteps';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { submitProposal } from '@waldur/proposals/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ProposalTeam } from './ProposalTeam';

const TEAM_VERIFICATION_FORM_ID = 'ProposalTeamVerificationStep';

const formErrorsSelector = (state) =>
  getFormSyncErrors(TEAM_VERIFICATION_FORM_ID)(state) as any;

const validate = (values) => {
  const errors: Record<string, any> = {};
  if (!values.users || values.users?.length === 0) {
    errors.users = 'At least one user is required';
  }
  return errors;
};

export const ProposalTeamVerificationStep: FC<{
  proposal;
  reviews?;
  refetch;
}> = ({ proposal, reviews, refetch }) => {
  const submitForm = useCallback(
    async (_, dispatch) => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate('Are you sure you want to submit the proposal?'),
        );
      } catch {
        return;
      }
      try {
        await submitProposal(proposal.uuid);
        refetch && refetch();
        dispatch(showSuccess(translate('Proposal submitted successfully')));
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Something went wrong')));
      }
    },
    [proposal],
  );

  const errors = useSelector(formErrorsSelector);
  const completedSteps = errors?.users ? [false] : [true];

  return (
    <Form
      form={TEAM_VERIFICATION_FORM_ID}
      onSubmit={submitForm}
      initialValues={{ users: [] }} // NOTE: we fill the "users" field in the ProposalTeam using table fetcher
      validate={validate}
    >
      {(formProps) => (
        <SidebarLayout.Container>
          <SidebarLayout.Body>
            <ProposalTeam
              proposal={proposal}
              change={formProps.change}
              reviews={reviews}
            />
          </SidebarLayout.Body>
          <SidebarLayout.Sidebar>
            <FormSteps
              steps={[
                {
                  label: translate('Proposed project team'),
                  id: 'step-team',
                  fields: ['users'],
                },
              ]}
              errors={errors}
              completedSteps={completedSteps}
            />
            <FloatingSubmitButton
              submitting={formProps.submitting}
              label={translate('Submit proposal')}
              errors={errors}
            />
          </SidebarLayout.Sidebar>
        </SidebarLayout.Container>
      )}
    </Form>
  );
};
