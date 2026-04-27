import { PlusCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useCallback, useEffect } from 'react';
import { reduxForm } from 'redux-form';
import { NestedRound, proposalProposalsCreate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton } from '@/form';
import { FormContainer } from '@/form/FormContainer';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { EndingField } from '@/proposals/EndingField';
import { Call } from '@/proposals/types';
import { Field } from '@/resource/summary';
import { useNotify } from '@/store/hooks';
import { UsersService } from '@/user/UsersService';

interface FormData {
  name: string;
}

export const AddProposalDialog = reduxForm<
  FormData,
  { resolve: { round: NestedRound; call: Call } }
>({
  form: 'AddProposalForm',
})((props) => {
  const router = useRouter();
  const { showSuccess, showErrorResponse } = useNotify();

  useEffect(() => {
    // Delay focus to run after modal animation and autoFocus complete (~150ms)
    const timer = setTimeout(() => {
      const input =
        document.querySelector<HTMLInputElement>('input[name="name"]');
      input?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const processRequest = useCallback(
    async (values: FormData) => {
      try {
        const response = await proposalProposalsCreate({
          body: {
            ...values,
            round_uuid: props.resolve.round.uuid,
          },
        });
        const proposal = response.data;
        showSuccess(translate('Proposal created successfully'));
        UsersService.refreshCurrentUser();
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
        iconNode={<PlusCircleIcon weight="bold" />}
        iconColor="success"
        footer={
          <>
            <CloseDialogButton variant="tertiary" className="w-125px" />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Create')}
              className="btn btn-primary w-125px"
            />
          </>
        }
      >
        <Field
          label={translate('Call name')}
          value={props.resolve.call.name}
          labelCol={4}
          valueCol={8}
          space={2}
        />
        <Field
          label={translate('Round reference')}
          value={props.resolve.round.name}
          labelCol={4}
          valueCol={8}
          space={2}
        />
        <Field
          label={translate('Round deadline')}
          value={
            <EndingField
              endDate={props.resolve.round.cutoff_time}
              dateFirst
              hasFixedDuration={Boolean(
                props.resolve.call.fixed_duration_in_days,
              )}
            />
          }
          labelCol={4}
          valueCol={8}
          space={2}
        />
        <FormContainer submitting={props.submitting} className="mt-7">
          <StringField
            label={translate('Name')}
            name="name"
            required
            validate={required}
            spaceless
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
