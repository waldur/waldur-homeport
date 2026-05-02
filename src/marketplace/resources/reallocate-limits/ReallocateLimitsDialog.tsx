import React from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm, formValueSelector } from 'redux-form';

import { ProgressStep } from '@/core/ProgressSteps';
import { translate } from '@/i18n';
import { StepsList } from '@/marketplace/common/StepsList';
import { WizardButtons } from '@/marketplace/offerings/import/WizardButtons';
import { WizardTabs } from '@/marketplace/offerings/import/WizardTabs';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { useWizard } from '@/wizard/useWizard';

import { loadData } from '../change-limits/utils';

import { ChangeResourceLimitsTab } from './ChangeResourceLimitsTab';
import { REALLOCATE_LIMITS_FORM_ID } from './constants';
import { ReallocateCapacityTab } from './ReallocateCapacityTab';
import { ReviewAndConfirmTab, submitReallocation } from './ReviewAndConfirmTab';
import { ReallocateFormData } from './types';
import { calculateFreedCapacity } from './utils';

interface ReallocateLimitsDialogProps {
  resolve: {
    resource: {
      marketplace_resource_uuid: string;
    };
    refetch?(): void;
  };
  submitting: boolean;
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

export const ReallocateLimitsDialog = reduxForm<
  ReallocateFormData,
  ReallocateLimitsDialogProps
>({
  form: REALLOCATE_LIMITS_FORM_ID,
})(({ resolve, handleSubmit, submitting, invalid, initialize }) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const asyncState = useAsync(
    () => loadData(resolve.resource.marketplace_resource_uuid),
    [resolve.resource.marketplace_resource_uuid],
  );

  React.useEffect(() => {
    if (asyncState.value) {
      initialize({
        limits: asyncState.value.initialValues.limits,
        targets: [],
      });
    }
  }, [asyncState.value, initialize]);

  const { step, setStep, goBack, goNext, isFirstStep, isLastStep } =
    useWizard(steps);

  const formSelector = formValueSelector(REALLOCATE_LIMITS_FORM_ID);
  const limits = useSelector((state) => formSelector(state, 'limits'));
  const targets = useSelector((state) => formSelector(state, 'targets'));

  const isStep1 = step.key === 'change-limits';
  const isStep2 = step.key === 'reallocate';
  let canProceed = !invalid;
  let nextButtonTooltip: string;

  if (isStep1 && asyncState.value) {
    const currentLimits = asyncState.value.limits;

    if (limits && currentLimits) {
      const freedCapacity = calculateFreedCapacity(currentLimits, limits);
      const hasFreedCapacity = Object.values(freedCapacity).some(
        (amount) => amount > 0,
      );
      canProceed = hasFreedCapacity;
    } else {
      canProceed = false;
    }
  } else if (isStep2 && asyncState.value) {
    const currentLimits = asyncState.value.limits;

    if (limits && currentLimits) {
      const freedCapacity = calculateFreedCapacity(currentLimits, limits);
      const components =
        asyncState.value.offering?.components?.filter(
          (c) => c.billing_type === 'limit',
        ) || [];

      const allAllocated = components.every((component) => {
        const freed = freedCapacity[component.type] || 0;
        if (freed === 0) return true;

        // Sum the allocated numbers for the component across multile resources
        const totalAllocated = (targets || []).reduce((sum, target) => {
          return sum + (target.allocated_limits[component.type] || 0);
        }, 0);

        return totalAllocated === freed;
      });

      canProceed = allAllocated && (targets?.length || 0) > 0;
      if (!canProceed) {
        nextButtonTooltip = translate('Allocate all free capacity to continue');
      }
    } else {
      canProceed = false;
    }
  }

  const onSubmit = async (formData: ReallocateFormData) => {
    if (isLastStep && asyncState.value) {
      await submitReallocation(
        formData,
        {
          asyncState: { value: asyncState.value },
          resolve,
        },
        { showSuccess, showErrorResponse, closeDialog },
      );
    } else {
      goNext();
    }
    return Promise.resolve();
  };

  if (asyncState.loading) {
    return (
      <ModalDialog title={translate('Reallocate Resource Limits')}>
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{translate('Loading...')}</span>
          </div>
        </div>
      </ModalDialog>
    );
  }

  if (asyncState.error) {
    return (
      <ModalDialog title={translate('Reallocate Resource Limits')}>
        <div className="text-center p-5">
          <h3>{translate('Unable to load data.')}</h3>
        </div>
      </ModalDialog>
    );
  }

  const resource = asyncState.value?.resource;
  const offering = asyncState.value?.offering;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ModalDialog
        title={translate('Reallocate Resource Limits')}
        subtitle={
          <>
            <div className="mb-0">
              {translate(
                'Adjust limits for a resource and redistribute freed capacity to other resources',
              )}
            </div>
            {resource && offering && (
              <div className="mt-3 mb-0">
                {translate('Source')}: {resource.customer_name} /{' '}
                {resource.project_name} / {resource.name} —{' '}
                {translate('Offering')}: {offering.name}
              </div>
            )}
          </>
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
        <div className="pt-4">
          <StepsList
            steps={steps}
            value={step}
            onClick={setStep}
            disabled={submitting}
          />
        </div>

        <div
          className="min-h-400px"
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
              asyncState,
              resolve,
            }}
          />
        </div>
      </ModalDialog>
    </form>
  );
});
