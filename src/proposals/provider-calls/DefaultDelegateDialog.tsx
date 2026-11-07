import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  proposalRequestedOfferingsSetDefaultDelegate,
  proposalRequestedOfferingsTeamRetrieve,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';

import { getTeamPeople } from './providerCalls';
import {
  NOBODY,
  personOptions,
  personUuid,
  TeamPersonOption,
} from './teamPersonOptions';

interface DefaultDelegateDialogProps {
  resolve: {
    row: ProviderRequestedOffering;
    refetch: () => void;
  };
}

interface FormValues {
  person: TeamPersonOption;
}

/** Who new slots of the offering's hand-on steps go to as they open. */
export const DefaultDelegateDialog: FC<DefaultDelegateDialogProps> = ({
  resolve,
}) => {
  const user = useUser();
  const { data: team, isLoading } = useQuery({
    queryKey: ['offering-team', resolve.row.uuid],
    queryFn: async () =>
      (
        await proposalRequestedOfferingsTeamRetrieve({
          path: { uuid: resolve.row.uuid },
        })
      ).data,
  });
  // Not the viewer: the person a slot is handed to may not hand it on, so
  // one handed to oneself could no longer be taken back by oneself.
  const people = useMemo(
    () => getTeamPeople(team).filter((person) => person.uuid !== user?.uuid),
    [team, user?.uuid],
  );
  const options = useMemo(
    () =>
      personOptions(people, {
        nobody: translate('Nobody: the offering’s managers keep them'),
      }),
    [people],
  );
  const initialValues = useMemo(
    () => ({
      person:
        options.find(
          (option) =>
            option.value === (resolve.row.default_delegate_uuid ?? NOBODY),
        ) ?? options[0],
    }),
    [options, resolve.row.default_delegate_uuid],
  );
  const { mutate, isPending } = useManagedMutation<any, any, FormValues>({
    mutationFn: ({ person }) =>
      proposalRequestedOfferingsSetDefaultDelegate({
        path: { uuid: resolve.row.uuid },
        body: { user_uuid: personUuid(person) },
      }),
    refetch: resolve.refetch,
    successMessage: translate('Default hand-on saved.'),
    errorMessage: translate('Unable to save the default hand-on.'),
  });

  if (isLoading) {
    return (
      <ModalDialog
        title={translate('Default hand-on')}
        footer={<CloseDialogButton />}
      >
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  return (
    <Form<FormValues>
      onSubmit={(values) => mutate(values)}
      initialValues={initialValues}
      render={({ handleSubmit, invalid, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Default hand-on')}
            subtitle={translate(
              'New slots of steps that can be handed on go to this person as they open.',
            )}
            footer={
              <>
                <CloseDialogButton disabled={isPending} />
                <SubmitButton
                  submitting={isPending}
                  disabled={invalid || pristine}
                  label={translate('Save')}
                />
              </>
            }
          >
            <SelectGroup
              name="person"
              label={translate('Hand new slots to')}
              options={options}
              validate={required}
              isClearable={false}
              required
              description={
                team?.delegates.length
                  ? undefined
                  : translate(
                      'Only the offering’s managers are on its team. To hand work to someone who does not manage the offering, give them the Offering evaluator role on its Team tab.',
                    )
              }
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
