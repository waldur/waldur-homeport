import { FC, useCallback, useMemo } from 'react';
import {
  proposalProtectedCallsRoundsUpdate,
  ProtectedRound,
  ProtectedRoundRequest,
} from 'waldur-js-client';

import { parseDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useOpenEndedRoundBlockedReason } from '@/proposals/roundCutoff';
import { Call } from '@/proposals/types';
import { WizardFormFirstPage } from '@/proposals/update/rounds/WizardFormFirstPage';
import { getRoundInitialValues, roundTimesInZone } from '@/proposals/utils';
import { WizardFormContainer } from '@/wizard';

interface EditRoundSubmissionDialogProps {
  resolve: {
    round: ProtectedRound;
    call: Call;
    refetch(): void;
  };
}

type RoundFormValues = ProtectedRoundRequest & { open_ended?: boolean };

const validate = (values: RoundFormValues) => {
  const errors: any = {};
  if (values.open_ended || !values.cutoff_time) {
    return errors;
  }
  if (parseDate(values.start_time) > parseDate(values.cutoff_time)) {
    errors.cutoff_time = translate('Cutoff date must be after start date');
  }
  return errors;
};

export const EditRoundSubmissionDialog: FC<EditRoundSubmissionDialogProps> = (
  props,
) => {
  const initialValues = useMemo(
    () => getRoundInitialValues(props.resolve.round),
    [props.resolve.round],
  );
  const formInitialValues = useMemo(
    () => ({
      ...initialValues,
      open_ended: !props.resolve.round.cutoff_time,
    }),
    [initialValues, props.resolve.round.cutoff_time],
  );
  const { closeDialog } = useModal();
  const openEndedBlocked = useOpenEndedRoundBlockedReason(props.resolve.call);
  const wizardForms = useMemo(
    () => [
      (stepProps) => (
        <WizardFormFirstPage
          {...stepProps}
          openEndedBlockedReason={openEndedBlocked}
          allowRepeats={false}
        />
      ),
    ],
    [openEndedBlocked],
  );

  const updateRoundMutation = useManagedMutation<
    any,
    any,
    ProtectedRoundRequest
  >({
    mutationFn: (formData) =>
      proposalProtectedCallsRoundsUpdate({
        path: {
          uuid: props.resolve.call.uuid,
          obj_uuid: props.resolve.round.uuid,
        },
        body: roundTimesInZone({
          ...initialValues,
          ...formData,
        }),
      }),
    successMessage: translate('Round has been updated.'),
    errorMessage: translate('Unable to update round.'),
    refetch: props.resolve.refetch,
    onSuccess: closeDialog,
  });

  const submit = useCallback(
    ({ open_ended, ...formData }: RoundFormValues) =>
      updateRoundMutation.mutateAsync(
        open_ended ? { ...formData, cutoff_time: null } : formData,
      ),
    [updateRoundMutation],
  );

  return (
    <WizardFormContainer
      form="RoundEditForm"
      title={translate('Edit round submission')}
      submitLabel={translate('Save')}
      hideStepper
      onSubmit={submit}
      steps={[
        { key: 'submission', label: translate('Submission'), completed: false },
      ]}
      wizardForms={wizardForms}
      initialValues={formInitialValues}
      validate={validate}
    />
  );
};
