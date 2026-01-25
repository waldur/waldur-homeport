import { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { ProgressSteps, ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ConfigurationStep } from './steps/ConfigurationStep';
import { ConnectionStep } from './steps/ConnectionStep';
import { DiscoveryStep } from './steps/DiscoveryStep';
import { MappingStep } from './steps/MappingStep';
import { PreviewStep } from './steps/PreviewStep';
import type { OidcDiscoveryDialogResolve, OidcDiscoveryState } from './types';

const INITIAL_STATE: OidcDiscoveryState = {
  connection: null,
  connectionValid: false,
  clientId: '',
  clientSecret: '',
  discoveryResult: null,
  claimsNotExposed: false,
  manualClaims: [],
  fieldMappings: [],
  configuration: {
    label: '',
    management_url: '',
    protected_fields: '',
    extra_scope: '',
    user_field: 'username',
    user_claim: 'sub',
    allowed_redirects: [],
    enable_pkce: true,
    enable_post_logout_redirect: true,
    is_active: true,
  },
};

interface OidcDiscoveryDialogProps {
  resolve: OidcDiscoveryDialogResolve;
}

export const OidcDiscoveryDialog = ({ resolve }: OidcDiscoveryDialogProps) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);

  // Initialize state with existing provider data if re-discovering
  const initialState = useMemo((): OidcDiscoveryState => {
    if (resolve.provider) {
      return {
        ...INITIAL_STATE,
        existingProvider: resolve.provider,
        connection: {
          discovery_url: resolve.provider.discovery_url,
          verify_ssl: resolve.provider.verify_ssl ?? true,
        },
        clientId: resolve.provider.client_id,
        clientSecret: resolve.provider.client_secret || '',
      };
    }
    return INITIAL_STATE;
  }, [resolve.provider]);

  const [state, setState] = useState<OidcDiscoveryState>(initialState);

  const updateState = useCallback((updates: Partial<OidcDiscoveryState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const steps: ProgressStep[] = [
    {
      key: 'connection',
      label: translate('Connection'),
      completed: state.connectionValid,
    },
    {
      key: 'discovery',
      label: translate('Discovery'),
      completed: state.discoveryResult !== null,
    },
    {
      key: 'mapping',
      label: translate('Mapping'),
      completed: state.fieldMappings.length > 0,
    },
    {
      key: 'configuration',
      label: translate('Configuration'),
      completed: Boolean(state.configuration.label),
    },
    {
      key: 'preview',
      label: translate('Preview & Save'),
      completed: false,
    },
  ];

  const handleClose = useCallback(() => {
    dispatch(closeModalDialog());
  }, [dispatch]);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setStep((prev) => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const renderStep = () => {
    const stepProps = {
      state,
      updateState,
      onNext: handleNext,
      onBack: handleBack,
      onCancel: handleClose,
    };

    switch (step) {
      case 0:
        return <ConnectionStep {...stepProps} />;
      case 1:
        return <DiscoveryStep {...stepProps} />;
      case 2:
        return <MappingStep {...stepProps} />;
      case 3:
        return <ConfigurationStep {...stepProps} />;
      case 4:
        return (
          <PreviewStep
            state={state}
            resolve={resolve}
            onBack={handleBack}
            onCancel={handleClose}
          />
        );
      default:
        return null;
    }
  };

  const title = resolve.provider
    ? translate('Re-discover OIDC Provider')
    : translate('OIDC Provider Discovery');

  return (
    <ModalDialog title={title} bodyClassName="p-0">
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
