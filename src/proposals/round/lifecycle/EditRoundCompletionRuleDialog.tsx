import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProtectedCallsRoundsUpdate,
  ProtectedRound,
  UndecidedAtRoundCompletionEnum,
} from 'waldur-js-client';

import { SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  getUndecidedAtCompletionOptions,
  undecidedAtCompletionLabel,
} from '@/proposals/roundLifecycle';
import { Call } from '@/proposals/types';
import { getRoundInitialValues } from '@/proposals/utils';

// The select needs a value for "no override"; the API takes null.
const INHERIT = 'inherit';

interface CompletionRuleFormValues {
  rule: UndecidedAtRoundCompletionEnum | typeof INHERIT;
}

interface EditRoundCompletionRuleDialogProps {
  resolve: {
    round: ProtectedRound;
    call: Call;
    refetch(): void;
  };
}

/**
 * Overrides, for one round, what completing it does with proposals still
 * without a decision. The round update is a full replacement, so the round's
 * other settings are sent back as they are, like the other round dialogs do.
 */
export const EditRoundCompletionRuleDialog: FC<
  EditRoundCompletionRuleDialogProps
> = ({ resolve: { round, call, refetch } }) => {
  const options = useMemo(
    () => [
      {
        value: INHERIT,
        label: translate("Use the call's setting ({rule})", {
          rule: undecidedAtCompletionLabel(
            call.undecided_at_round_completion ?? 'refuse',
          ),
        }),
      },
      ...getUndecidedAtCompletionOptions(),
    ],
    [call.undecided_at_round_completion],
  );

  const initialValues = useMemo<CompletionRuleFormValues>(() => {
    const own = round.undecided_at_round_completion;
    return { rule: own === 'refuse' || own === 'reject' ? own : INHERIT };
  }, [round.undecided_at_round_completion]);

  const update = useManagedMutation<any, any, CompletionRuleFormValues>({
    mutationFn: (values) =>
      proposalProtectedCallsRoundsUpdate({
        path: { uuid: call.uuid, obj_uuid: round.uuid },
        body: {
          ...getRoundInitialValues(round),
          undecided_at_round_completion:
            values.rule === INHERIT ? null : values.rule,
        },
      }),
    successMessage: translate('Round has been updated.'),
    errorMessage: translate('Unable to update round.'),
    refetch,
  });

  return (
    <Form<CompletionRuleFormValues>
      onSubmit={(values) => update.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Undecided proposals at completion')}
            subtitle={translate(
              'What completing round "{name}" does with proposals that still have no decision.',
              { name: round.name },
            )}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <SelectGroup
              name="rule"
              label={translate('When the round is completed')}
              options={options}
              simpleValue
              isClearable={false}
              required
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
