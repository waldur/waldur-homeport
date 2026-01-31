import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { ArrowCredentialsRequest } from 'waldur-js-client';

import { ProgressSteps, ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ArrowDiscoveryState, INITIAL_DISCOVERY_STATE } from '../types';

import { Step1Credentials } from './Step1Credentials';
import { Step2CustomerDiscovery } from './Step2CustomerDiscovery';
import { Step3Preview } from './Step3Preview';

export const ArrowSetupDialog = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<ArrowDiscoveryState>(
    INITIAL_DISCOVERY_STATE,
  );

  const updateState = useCallback((updates: Partial<ArrowDiscoveryState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const steps: ProgressStep[] = [
    {
      key: 'credentials',
      label: translate('Credentials'),
      completed: state.credentialsValid,
    },
    {
      key: 'customers',
      label: translate('Customer Mapping'),
      completed: state.selectedMappings.size > 0,
    },
    {
      key: 'preview',
      label: translate('Preview & Save'),
      completed: false,
    },
  ];

  const handleCredentialsValidated = useCallback(
    (
      credentials: ArrowCredentialsRequest,
      partnerInfo: { partner_name: string; partner_reference: string },
    ) => {
      updateState({
        credentials,
        credentialsValid: true,
        partnerInfo,
      });
      setStep(1);
    },
    [updateState],
  );

  const handleCustomersMapped = useCallback(
    (selectedMappings: Map<string, string>) => {
      updateState({ selectedMappings });
      setStep(2);
    },
    [updateState],
  );

  const handleClose = useCallback(() => {
    dispatch(closeModalDialog());
  }, [dispatch]);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(0, prev - 1));
  }, []);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Step1Credentials
            onValidated={handleCredentialsValidated}
            onCancel={handleClose}
          />
        );
      case 1:
        return (
          <Step2CustomerDiscovery
            credentials={state.credentials!}
            onMapped={handleCustomersMapped}
            onBack={handleBack}
            onCancel={handleClose}
          />
        );
      case 2:
        return (
          <Step3Preview
            state={state}
            onBack={handleBack}
            onClose={handleClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ModalDialog
      title={translate('Arrow Integration Setup')}
      bodyClassName="p-0"
    >
      <div className="p-6 pb-0">
        <ProgressSteps
          steps={steps}
          className="mb-6"
          onClick={(_, index) => {
            // Only allow going back to completed steps
            if (index < step) {
              setStep(index);
            }
          }}
        />
      </div>
      <div className="p-6">{renderStep()}</div>
    </ModalDialog>
  );
};
