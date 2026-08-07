import { MegaphoneIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import { marketplacePlansList, ProviderOffering } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { DateGroup, SelectGroup, StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Field } from '@/resource/summary';

import { offerViaCall, OfferViaCallStep } from './offerViaCall';

interface OfferViaCallDialogProps {
  resolve: {
    offering: ProviderOffering;
    refetch?: () => void;
  };
}

interface FormData {
  name: string;
  cutoff_time: string;
  plan: { value: string; label: string };
}

const stepLabel = (step: OfferViaCallStep): string => {
  switch (step) {
    case 'organisation':
      return translate('Registering the managing organisation');
    case 'call':
      return translate('Creating the call');
    case 'round':
      return translate('Opening a submission window');
    case 'offering':
      return translate('Adding the offering');
    case 'accept':
      return translate('Accepting the offering');
    case 'activate':
      return translate('Activating the call');
    default:
      return step;
  }
};

/** A year out: long enough that nobody has to babysit a pilot or a demo. */
const defaultCutoff = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

export const OfferViaCallDialog: FC<OfferViaCallDialogProps> = (props) => {
  const { offering, refetch } = props.resolve;
  const router = useRouter();
  const [step, setStep] = useState<OfferViaCallStep | null>(null);

  // Fetched rather than read off the row: the provider offering list asks for
  // a sparse field set that leaves `plans` out, so a row alone cannot tell an
  // offering with no plan from one whose plans simply were not requested.
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['OfferViaCallPlans', offering.uuid],
    queryFn: () =>
      marketplacePlansList({ query: { offering_uuid: offering.uuid } }).then(
        (response) => response.data,
      ),
  });

  // Only a live plan can be requested; an archived one would be accepted here
  // and then refused when an applicant tried to use it.
  const planOptions = useMemo(
    () =>
      (plans || [])
        .filter((plan) => !plan.archived)
        .map((plan) => ({ value: plan.uuid as string, label: plan.name })),
    [plans],
  );

  const initialValues = useMemo(
    () => ({
      name: offering.name,
      cutoff_time: defaultCutoff(),
      // Choose for the operator when there is nothing to choose between.
      plan: planOptions.length === 1 ? planOptions[0] : undefined,
    }),
    [offering.name, planOptions],
  );

  const { mutateAsync, isPending } = useManagedMutation<any, any, FormData>({
    mutationFn: (values) =>
      offerViaCall({
        offeringUuid: offering.uuid,
        customerUuid: offering.customer_uuid,
        name: values.name,
        // The picker yields a date; the call closes at the end of that day.
        cutoffTime: new Date(`${values.cutoff_time}T23:59:59`).toISOString(),
        planUuid: values.plan.value,
        onProgress: setStep,
      }),
    successMessage: translate('The offering can now be requested via a call.'),
    // The chain is not transactional, so say what survived rather than
    // implying nothing happened.
    errorMessage: translate(
      'Could not finish setting up the call. Anything already created is left behind as a draft call.',
    ),
    refetch,
    onSuccess: (callUuid: any) => {
      router.stateService.go('protected-call.main', { call_uuid: callUuid });
    },
  });

  if (plansLoading) {
    return (
      <ModalDialog
        title={translate('Offer via call')}
        iconNode={<MegaphoneIcon weight="bold" />}
        footer={<CloseDialogButton className="min-w-125px" />}
      >
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  if (!planOptions.length) {
    return (
      <ModalDialog
        title={translate('Offer via call')}
        iconNode={<MegaphoneIcon weight="bold" />}
        footer={<CloseDialogButton className="min-w-125px" />}
      >
        <p className="mb-0">
          {translate(
            'This offering has no active plan. Requests through a call are priced against a plan, so add one first.',
          )}
        </p>
      </ModalDialog>
    );
  }

  return (
    <Form<FormData>
      onSubmit={mutateAsync}
      initialValues={initialValues}
      render={({ handleSubmit, invalid, submitting }) => {
        const busy = submitting || isPending;
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Offer via call')}
              subtitle={translate(
                'Creates a call, opens a submission window and lists this offering in it, so users can request access.',
              )}
              iconNode={<MegaphoneIcon weight="bold" />}
              iconColor="success"
              footer={
                <>
                  <CloseDialogButton
                    variant="tertiary"
                    className="min-w-125px"
                  />
                  <SubmitButton
                    disabled={invalid}
                    submitting={busy}
                    label={translate('Create')}
                    className="btn btn-primary min-w-125px"
                  />
                </>
              }
            >
              <Field
                label={translate('Offering')}
                value={offering.name}
                labelCol={4}
                valueCol={8}
                space={2}
              />
              <div className="mt-7">
                <StringGroup
                  name="name"
                  label={translate('Call name')}
                  required
                  validate={required}
                  disabled={busy}
                />
                <DateGroup
                  name="cutoff_time"
                  label={translate('Submission closes')}
                  description={translate(
                    'Requests are accepted until the end of this day.',
                  )}
                  required
                  validate={required}
                  disabled={busy}
                />
                <SelectGroup
                  name="plan"
                  label={translate('Plan')}
                  description={translate(
                    'Requests are priced against this plan.',
                  )}
                  options={planOptions}
                  required
                  validate={required}
                  isClearable={false}
                  isDisabled={busy}
                  spaceless
                />
              </div>
              {step && busy ? (
                <p className="text-muted fs-7 mt-4 mb-0">{stepLabel(step)}…</p>
              ) : null}
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
