import { useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Form } from 'react-final-form';
import {
  DelegateTeamSlotsResult,
  OfferingTeamPerson,
  OfferingTeamSlot,
  proposalRequestedOfferingsDelegateSlots,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { required } from '@/core/validators';
import { SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  personOptions,
  personUuid,
  TeamPersonOption,
} from './teamPersonOptions';

interface HandOnSlotsDialogProps {
  resolve: {
    requestedOfferingUuid: string;
    slots: OfferingTeamSlot[];
    people: OfferingTeamPerson[];
    refetch: () => void;
  };
}

interface FormValues {
  person: TeamPersonOption;
}

/**
 * Hands the chosen open slots to one person on the offering's team, or takes
 * them back to its managers. Slots the backend leaves as they were are listed
 * with why, rather than closing the dialog over them.
 */
export const HandOnSlotsDialog: FC<HandOnSlotsDialogProps> = ({ resolve }) => {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<DelegateTeamSlotsResult>();
  const { mutate, isPending } = useManagedMutation<
    DelegateTeamSlotsResult,
    any,
    FormValues
  >({
    mutationFn: async ({ person }) =>
      (
        await proposalRequestedOfferingsDelegateSlots({
          path: { uuid: resolve.requestedOfferingUuid },
          body: {
            contribution_uuids: resolve.slots.map((slot) => slot.uuid),
            user_uuid: personUuid(person),
          },
        })
      ).data,
    closeModal: false,
    errorMessage: translate('Unable to hand the slots on.'),
    onSuccess: (data) => {
      resolve.refetch();
      queryClient.invalidateQueries({ queryKey: ['team-slots'] });
      setResult(data);
    },
  });

  const skipped = Object.entries(result?.skipped ?? {});
  const nameOf = (uuid: string) =>
    resolve.slots.find((slot) => slot.uuid === uuid)?.proposal_name ?? uuid;

  return (
    <Form<FormValues>
      onSubmit={(values) => mutate(values)}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Hand on selected slots ({count})', {
              count: resolve.slots.length,
            })}
            subtitle={translate(
              'They take the slot over once they accept it; until then the offering’s managers keep it.',
            )}
            footer={
              result ? (
                <CloseDialogButton label={translate('Done')} />
              ) : (
                <>
                  <CloseDialogButton disabled={isPending} />
                  <SubmitButton
                    submitting={isPending}
                    disabled={invalid}
                    label={translate('Hand on')}
                  />
                </>
              )
            }
          >
            {result ? (
              <AlertItem
                type="floating"
                variant={skipped.length ? 'warning' : 'success'}
                title={translate('Handed on {count} of {total} slots.', {
                  count: result.handed_on.length,
                  total: resolve.slots.length,
                })}
                body={
                  skipped.length ? (
                    <ul className="mb-0 ps-3" data-testid="skipped-slots">
                      {skipped.map(([uuid, reason]) => (
                        <li key={uuid}>
                          <span className="font-semibold">{nameOf(uuid)}</span>
                          {': '}
                          {reason}
                        </li>
                      ))}
                    </ul>
                  ) : null
                }
              />
            ) : (
              <SelectGroup
                name="person"
                label={translate('Hand to')}
                placeholder={translate('Choose who takes them over')}
                options={personOptions(resolve.people, {
                  nobody: translate('Offering managers (take back)'),
                })}
                validate={required}
                isClearable={false}
                required
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
