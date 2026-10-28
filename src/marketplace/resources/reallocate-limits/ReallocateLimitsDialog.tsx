import { useQuery } from '@tanstack/react-query';
import React, { FunctionComponent } from 'react';
import { Form } from 'react-final-form';

import { LoadingSpinner } from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  ProgressStep,
  WizardButtons,
  WizardStepIndicator,
  WizardTabs,
  useWizard,
} from '@/wizard';

import { loadData } from '../change-limits/utils';

import { ChangeResourceLimitsTab } from './ChangeResourceLimitsTab';
import { ReallocateCapacityTab } from './ReallocateCapacityTab';
import { reallocateLimits, ReviewAndConfirmTab } from './ReviewAndConfirmTab';
import { ReallocateFormData } from './types';
import { getValidationState } from './utils';

interface ReallocateLimitsDialogProps {
  resolve: {
    resource: {
      marketplace_resource_uuid: string;
    };
    refetch?(): void;
  };
}

const steps: ProgressStep[] = [
  {
    key: 'change-limits',
    label: translate('Change resource limits'),
    completed: true,
  },
  {
    key: 'reallocate',
    label: translate('Reallocate freed capacity'),
    completed: false,
  },
  {
    key: 'review',
    label: translate('Review & confirm'),
    completed: false,
  },
];

const tabs = {
  'change-limits': ChangeResourceLimitsTab,
  reallocate: ReallocateCapacityTab,
  review: ReviewAndConfirmTab,
};

const ReallocateLimitsDialogSubtitle = ({ resource, offering }) => (
  <>
    <div className="mb-0">
      {translate(
        'Adjust limits for a resource and redistribute freed capacity to other resources',
      )}
    </div>
    {resource && offering && (
      <div className="mt-2.5 mb-0">
        {translate('Source')}: {resource.customer_name} /{' '}
        {resource.project_name} / {resource.name} — {translate('Offering')}:{' '}
        {offering.name}
      </div>
    )}
  </>
);

export const ReallocateLimitsDialog: FunctionComponent<
  ReallocateLimitsDialogProps
> = ({ resolve }) => {
  const dataQuery = useQuery({
    queryKey: ['reallocate-limits', resolve.resource.marketplace_resource_uuid],
    queryFn: () => loadData(resolve.resource.marketplace_resource_uuid),
    staleTime: STALE_TIME,
  });

  const { step, setStep, goBack, goNext, isFirstStep, isLastStep } =
    useWizard(steps);

  const { mutate: submitReallocation } = useManagedMutation({
    mutationFn: (values: ReallocateFormData) =>
      reallocateLimits(values, dataQuery.data),
    successMessage: translate(
      'Resource limits reallocation request has been submitted.',
    ),
    errorMessage: translate('Unable to submit reallocation request.'),
    refetch: resolve.refetch,
  });

  const initialValues = React.useMemo(
    () => ({
      limits: dataQuery.data?.initialValues?.limits || {},
      targets: [],
    }),
    [dataQuery.data],
  );

  if (dataQuery.isLoading) {
    return (
      <ModalDialog title={translate('Reallocate resource limits')}>
        <div className="text-center p-4">
          <LoadingSpinner
            size={32}
            className="text-brand"
            aria-label={translate('Loading...')}
          />
        </div>
      </ModalDialog>
    );
  }

  if (dataQuery.error) {
    return (
      <ModalDialog title={translate('Reallocate resource limits')}>
        <div className="text-center p-4">
          <h3>{translate('Unable to load data.')}</h3>
        </div>
      </ModalDialog>
    );
  }

  const resource = dataQuery.data?.resource;
  const offering = dataQuery.data?.offering;

  return (
    <Form<ReallocateFormData>
      onSubmit={(values) => {
        if (isLastStep && dataQuery.data) {
          submitReallocation(values);
        } else {
          goNext();
        }
      }}
      initialValues={initialValues}
    >
      {({ handleSubmit, submitting, invalid, values }) => {
        const { canProceed, nextButtonTooltip, freedCapacity } =
          getValidationState(step.key, values, dataQuery.data, invalid);

        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Reallocate resource limits')}
              subtitle={
                <ReallocateLimitsDialogSubtitle
                  resource={resource}
                  offering={offering}
                />
              }
              headerClassName="pb-0"
              footer={
                <WizardButtons
                  isLastStep={isLastStep}
                  isFirstStep={isFirstStep}
                  goBack={goBack}
                  goNext={goNext}
                  submitting={submitting}
                  invalid={!canProceed}
                  submitLabel={translate('Confirm')}
                  tooltip={nextButtonTooltip}
                />
              }
              className="overflow-hidden"
              bodyClassName="overflow-hidden border-0 pt-0"
            >
              <div className="pt-3">
                <WizardStepIndicator
                  steps={steps}
                  value={step}
                  onClick={setStep}
                  disabled={submitting}
                />
              </div>

              <div
                className="min-h-[400px]"
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}
              >
                <WizardTabs
                  steps={steps}
                  currentStep={step}
                  tabs={tabs}
                  mountOnEnter={true}
                  context={{
                    asyncState: { value: dataQuery.data },
                    freedCapacity,
                    resolve,
                  }}
                />
              </div>
            </ModalDialog>
          </form>
        );
      }}
    </Form>
  );
};
