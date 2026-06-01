import { PlusCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useEffect } from 'react';
import { Form } from 'react-final-form';
import { NestedRound, proposalProposalsCreate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { EndingField } from '@/proposals/EndingField';
import { Call } from '@/proposals/types';
import { Field } from '@/resource/summary';
import { UsersService } from '@/user/UsersService';

interface FormData {
  name: string;
}

interface AddProposalDialogProps {
  resolve: { round: NestedRound; call: Call };
}

export const AddProposalDialog: FC<AddProposalDialogProps> = (props) => {
  const router = useRouter();

  useEffect(() => {
    // Delay focus to run after modal animation and autoFocus complete (~150ms)
    const timer = setTimeout(() => {
      const input =
        document.querySelector<HTMLInputElement>('input[name="name"]');
      input?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const { mutate, isPending } = useManagedMutation({
    mutationFn: (values: FormData) =>
      proposalProposalsCreate({
        body: {
          ...values,
          round_uuid: props.resolve.round.uuid,
        },
      }),
    onSuccess: (response) => {
      UsersService.refreshCurrentUser();
      router.stateService.go('proposals.manage-proposal', {
        proposal_uuid: response.data.uuid,
      });
    },
    successMessage: translate('Proposal created successfully'),
  });

  return (
    <Form<FormData>
      onSubmit={mutate}
      render={({ handleSubmit, invalid, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create proposal')}
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton variant="tertiary" className="w-125px" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting || isPending}
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
            <div className="mt-7">
              <StringGroup
                label={translate('Name')}
                name="name"
                required
                validate={required}
                spaceless
                disabled={submitting || isPending}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
