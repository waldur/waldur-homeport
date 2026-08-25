import {
  CaretLeftIcon,
  CaretRightIcon,
  MegaphoneIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';
import { marketplacePlansList, ProviderOffering } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ProgressStep, Wizard, WizardFooterRenderProps } from '@/wizard';

import { offerViaCall, OfferViaCallStep } from './offerViaCall';
import { OfferViaCallDetailsStep } from './OfferViaCallDetailsStep';
import {
  defaultSteps,
  enabledStepIds,
  OfferViaCallFormData,
} from './offerViaCallForm';
import { OfferViaCallWorkflowStep } from './OfferViaCallWorkflowStep';

interface OfferViaCallDialogProps {
  resolve: {
    offering: ProviderOffering;
    refetch?: () => void;
  };
}

// Two pages rather than one long form: the details are always filled in, the
// workflow almost never is. Keeping them apart lets the second page carry the
// explanation the choice needs without pushing the required fields off screen.
const wizardSteps = (): ProgressStep[] => [
  { key: 'details', label: translate('Call details'), completed: false },
  { key: 'workflow', label: translate('Workflow'), completed: false },
];

const wizardForms = [OfferViaCallDetailsStep, OfferViaCallWorkflowStep];

/**
 * Named buttons rather than the wizard's default footer, whose Next button
 * renders as a bare caret: an unlabelled arrow is a poor thing to ask someone
 * to press when the next page decides how the call is reviewed.
 */
const renderFooter = ({
  step,
  totalSteps,
  submitting,
  invalid,
  onPrev,
}: WizardFooterRenderProps<OfferViaCallFormData>) => {
  const isLast = step === totalSteps - 1;
  return (
    <>
      {step > 0 && (
        <SubmitButton
          type="button"
          variant="tertiary"
          className="min-w-125px me-auto"
          submitting={false}
          onClick={() => onPrev()}
          label={translate('Back')}
          iconNode={<CaretLeftIcon weight="bold" />}
          iconOnLeft
        />
      )}
      <CloseDialogButton variant="tertiary" className="min-w-125px" />
      <SubmitButton
        submitting={submitting}
        invalid={invalid}
        label={isLast ? translate('Create') : translate('Next')}
        iconNode={isLast ? undefined : <CaretRightIcon weight="bold" />}
        className="min-w-125px"
      />
    </>
  );
};

/** A year out: long enough that nobody has to babysit a pilot or a demo. */
const defaultCutoff = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

const dialogShell = (children) => (
  <ModalDialog
    title={translate('Offer via call')}
    iconNode={<MegaphoneIcon weight="bold" />}
    footer={<CloseDialogButton className="min-w-125px" />}
  >
    {children}
  </ModalDialog>
);

export const OfferViaCallDialog: FC<OfferViaCallDialogProps> = (props) => {
  const { offering, refetch } = props.resolve;
  const router = useRouter();
  const [chainStep, setChainStep] = useState<OfferViaCallStep | null>(null);

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
      // `manager` is deliberately absent. The service provider is only
      // sometimes the right call manager, and prefilling it would get accepted
      // unread — a call cannot change manager afterwards, so the wrong guess
      // is expensive.
      steps: defaultSteps(),
    }),
    [offering.name, planOptions],
  );

  const { mutateAsync } = useManagedMutation<any, any, OfferViaCallFormData>({
    mutationFn: (values) =>
      offerViaCall({
        offeringUuid: offering.uuid,
        managerCustomerUuid: values.manager.uuid,
        name: values.name,
        // The picker yields a date; the call closes at the end of that day.
        cutoffTime: new Date(`${values.cutoff_time}T23:59:59`).toISOString(),
        planUuid: values.plan.value,
        enabledSteps: enabledStepIds(values.steps),
        onProgress: setChainStep,
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
    return dialogShell(<LoadingSpinner />);
  }

  if (!planOptions.length) {
    return dialogShell(
      <p className="mb-0">
        {translate(
          'This offering has no active plan. Requests through a call are priced against a plan, so add one first.',
        )}
      </p>,
    );
  }

  return (
    <Wizard<OfferViaCallFormData>
      title={translate('Offer via call')}
      subtitle={translate(
        'Creates a call, opens a submission window and lists this offering in it, so users can request access.',
      )}
      steps={wizardSteps()}
      wizardForms={wizardForms}
      initialValues={initialValues}
      onSubmit={(values) => mutateAsync(values)}
      submitLabel={translate('Create')}
      modalProps={{
        iconNode: <MegaphoneIcon weight="bold" />,
        iconColor: 'success',
      }}
      renderFooter={renderFooter}
      data={{ offering, planOptions, chainStep }}
    />
  );
};
