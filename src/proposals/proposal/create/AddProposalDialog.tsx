import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { createProposal } from '@waldur/proposals/api';
import { Call, Round } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface FormData {
  name: string;
}

export const AddProposalDialog = reduxForm<
  FormData,
  { resolve: { round: Round; call: Call } }
>({
  form: 'AddProposalForm',
})((props) => {
  const router = useRouter();
  const processRequest = useCallback(
    (values: FormData, dispatch) => {
      const formData = {
        ...values,
        round_uuid: props.resolve.round.uuid,
      };
      return createProposal(formData)
        .then((res) => {
          dispatch(showSuccess(translate('Proposal created successfully')));
          const proposal = res.data;
          router.stateService.go('public-calls.manage-proposal', {
            proposal_uuid: proposal.uuid,
          });
        })
        .catch((error) => {
          dispatch(showErrorResponse(error, translate('Something went wrong')));
        });
    },
    [props.resolve, router],
  );

  return (
    <form onSubmit={props.handleSubmit(processRequest)}>
      <ModalDialog
        title={translate('Create proposal')}
        closeButton
        footer={
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Create')}
          />
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
