import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProposalsRequestChanges,
  proposalProposalsUnlockablePartsRetrieve,
  ProposalWorkflowStepInstance,
} from 'waldur-js-client';

import { DateTimeGroup, SelectGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { changeRequestPartLabel } from '@/proposals/proposal/changeRequests';
import { Proposal } from '@/proposals/types';

import { proposalWorkflowStatesKey } from './queries';

interface RequestChangesFormValues {
  message?: string;
  parts?: string[];
  due_at?: string | Date | null;
}

interface RequestChangesDialogProps {
  resolve: {
    proposal: Proposal;
    step: ProposalWorkflowStepInstance;
    refetch?(): void;
  };
}

const validateMessage = (value?: string) =>
  value?.trim() ? undefined : translate('This field is required.');

const validateParts = (value?: string[]) =>
  value?.length ? undefined : translate('Choose at least one part.');

const validateDueAt = (value: string | Date | null) => {
  if (!value) return undefined;
  return new Date(value) <= new Date()
    ? translate('The due date must be in the future.')
    : undefined;
};

/**
 * Sends a proposal in review back to its applicant to change the parts the
 * step's actor unlocks. The proposal stays in review on its step; the step
 * does not lapse while the applicant works on the changes.
 */
export const RequestChangesDialog: FC<RequestChangesDialogProps> = ({
  resolve: { proposal, step, refetch },
}) => {
  const openedAt = useMemo(() => new Date(), []);
  const { data: parts, isLoading } = useQuery({
    // A step of an extension request or final report unlocks the run's
    // own parts.
    queryKey: ['ProposalUnlockableParts', proposal.uuid, step.uuid],
    queryFn: () =>
      proposalProposalsUnlockablePartsRetrieve({
        path: { uuid: proposal.uuid },
        query: { step_uuid: step.uuid },
      }).then((response) => response.data.parts),
  });
  const options = useMemo(
    () =>
      (parts ?? []).map((part) => ({
        value: part,
        label: changeRequestPartLabel(part),
      })),
    [parts],
  );

  const request = useManagedMutation<any, any, RequestChangesFormValues>({
    mutationFn: (values) =>
      proposalProposalsRequestChanges({
        path: { uuid: proposal.uuid },
        body: {
          step_uuid: step.uuid,
          message: values.message!.trim(),
          parts: values.parts!,
          due_at: values.due_at ? new Date(values.due_at).toISOString() : null,
        },
      }),
    successMessage: translate('Changes have been requested of the applicant.'),
    errorMessage: translate('Unable to request changes.'),
    refetch,
    invalidateQueries: [{ queryKey: proposalWorkflowStatesKey(proposal.uuid) }],
  });

  return (
    <Form<RequestChangesFormValues>
      onSubmit={(values) => request.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Request changes')}
            subtitle={translate(
              'The applicant may edit the parts you choose and submit the changes. The proposal stays in review on this step, which does not lapse meanwhile. You can request changes again after each submission.',
            )}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Request changes')}
                />
              </>
            }
          >
            <TextGroup
              name="message"
              label={translate('Message to the applicant')}
              required
              validate={validateMessage}
              maxLength={2000}
              placeholder={translate(
                'For example, attach the signed letter of support',
              )}
            />
            <SelectGroup
              name="parts"
              label={translate('Parts the applicant may change')}
              required
              isMulti
              simpleValue
              options={options}
              isLoading={isLoading}
              validate={validateParts}
              placeholder={translate('Select parts...')}
            />
            <DateTimeGroup
              name="due_at"
              label={translate('Due date')}
              description={translate(
                'Optional. Past it, the request lapses and the step returns to you; nothing is decided automatically.',
              )}
              minDate={openedAt}
              validate={validateDueAt}
              forceTouched
              placeholder={translate('Select date and time...')}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
