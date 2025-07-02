import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import { reduxForm } from 'redux-form';
import { proposalProposalsCreate } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Call } from '@waldur/proposals/types';
import { useNotify } from '@waldur/store/hooks';
import { UsersService } from '@waldur/user/UsersService';

interface FormData {
  name: string;
}

export const AddProposalDialog = reduxForm<
  FormData,
  { resolve: { round_uuid: string; call: Call } }
>({
  form: 'AddProposalForm',
})((props) => {
  const router = useRouter();
  const { showSuccess, showErrorResponse } = useNotify();
  const processRequest = useCallback(
    async (values: FormData) => {
      try {
        const response = await proposalProposalsCreate({
          body: {
            ...values,
            round_uuid: props.resolve.round_uuid,
          },
        });
        const proposal = response.data;
        showSuccess(translate('Proposal created successfully'));
        UsersService.getCurrentUser(true);
        router.stateService.go('proposals.manage-proposal', {
          proposal_uuid: proposal.uuid,
        });
      } catch (error) {
        showErrorResponse(error, translate('Something went wrong'));
      }
    },
    [props.resolve, router],
  );

  return (
    <form onSubmit={props.handleSubmit(processRequest)}>
      <ModalDialog
        title={translate('Create proposal')}
        footer={
          <>
            <CloseDialogButton
              variant="outline btn-outline-default"
              className="flex-equal"
            />

            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Create')}
              className="btn btn-primary flex-equal"
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <StringField
            label={translate('Name')}
            name="name"
            required
            validate={required}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
