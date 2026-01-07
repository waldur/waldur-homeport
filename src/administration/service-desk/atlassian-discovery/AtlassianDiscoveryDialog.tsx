import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { supportSettingsAtlassianCurrentSettingsRetrieve } from 'waldur-js-client';

import { ProgressSteps, ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { CredentialsStep } from './steps/CredentialsStep';
import { FieldMappingStep } from './steps/FieldMappingStep';
import { PreviewStep } from './steps/PreviewStep';
import { ProjectStep } from './steps/ProjectStep';
import { RequestTypesStep } from './steps/RequestTypesStep';
import type { AtlassianCredentials, DiscoveryState } from './types';

const INITIAL_STATE: DiscoveryState = {
  credentials: null,
  credentialsValid: false,
  projects: [],
  selectedProject: null,
  requestTypes: [],
  selectedRequestTypes: [],
  customFields: [],
  priorities: [],
  fieldMappings: {},
};

export const AtlassianDiscoveryDialog = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<DiscoveryState>(INITIAL_STATE);

  // Load current settings to pre-fill the form
  const { data: currentSettings } = useQuery({
    queryKey: ['AtlassianCurrentSettings'],
    queryFn: () => supportSettingsAtlassianCurrentSettingsRetrieve(),
    staleTime: 0,
  });

  // Build initial credentials from current settings
  const initialCredentials = useMemo(():
    | Partial<AtlassianCredentials>
    | undefined => {
    const settings = currentSettings?.data as
      | Record<string, unknown>
      | undefined;
    if (!settings?.ATLASSIAN_API_URL) return undefined;

    return {
      api_url: settings.ATLASSIAN_API_URL as string,
      verify_ssl: (settings.ATLASSIAN_VERIFY_SSL as boolean) ?? true,
      auth_method:
        (settings.auth_method as AtlassianCredentials['auth_method']) ||
        'api_token',
      email: (settings.ATLASSIAN_EMAIL as string) || '',
      username: (settings.ATLASSIAN_USERNAME as string) || '',
      // Secrets (token, password, personal_access_token) are not pre-filled for security
    };
  }, [currentSettings]);

  const updateState = useCallback((updates: Partial<DiscoveryState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const steps: ProgressStep[] = [
    {
      key: 'credentials',
      label: translate('Credentials'),
      completed: state.credentialsValid,
    },
    {
      key: 'project',
      label: translate('Project'),
      completed: state.selectedProject !== null,
    },
    {
      key: 'request_types',
      label: translate('Request Types'),
      completed: state.selectedRequestTypes.length > 0,
    },
    {
      key: 'fields',
      label: translate('Field Mapping'),
      completed: Object.keys(state.fieldMappings).length > 0,
    },
    {
      key: 'preview',
      label: translate('Preview & Save'),
      completed: false,
    },
  ];

  const handleCredentialsValidated = useCallback(
    (credentials: AtlassianCredentials) => {
      updateState({
        credentials,
        credentialsValid: true,
      });
      setStep(1);
    },
    [updateState],
  );

  const handleProjectSelected = useCallback(
    (
      project: DiscoveryState['selectedProject'],
      projects: DiscoveryState['projects'],
    ) => {
      updateState({
        selectedProject: project,
        projects,
        // Reset downstream state when project changes
        requestTypes: [],
        selectedRequestTypes: [],
        customFields: [],
        fieldMappings: {},
      });
      setStep(2);
    },
    [updateState],
  );

  const handleRequestTypesSelected = useCallback(
    (
      selectedTypes: DiscoveryState['selectedRequestTypes'],
      allTypes: DiscoveryState['requestTypes'],
    ) => {
      updateState({
        selectedRequestTypes: selectedTypes,
        requestTypes: allTypes,
      });
      setStep(3);
    },
    [updateState],
  );

  const handleFieldMappingsSet = useCallback(
    (
      mappings: DiscoveryState['fieldMappings'],
      customFields: DiscoveryState['customFields'],
      priorities: DiscoveryState['priorities'],
    ) => {
      updateState({
        fieldMappings: mappings,
        customFields,
        priorities,
      });
      setStep(4);
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
          <CredentialsStep
            initialValues={initialCredentials}
            onValidated={handleCredentialsValidated}
            onCancel={handleClose}
          />
        );
      case 1:
        return (
          <ProjectStep
            credentials={state.credentials!}
            onSelected={handleProjectSelected}
            onBack={handleBack}
            onCancel={handleClose}
          />
        );
      case 2:
        return (
          <RequestTypesStep
            credentials={state.credentials!}
            project={state.selectedProject!}
            onSelected={handleRequestTypesSelected}
            onBack={handleBack}
            onCancel={handleClose}
          />
        );
      case 3:
        return (
          <FieldMappingStep
            credentials={state.credentials!}
            project={state.selectedProject!}
            selectedRequestTypes={state.selectedRequestTypes}
            onMappingsSet={handleFieldMappingsSet}
            onBack={handleBack}
            onCancel={handleClose}
          />
        );
      case 4:
        return (
          <PreviewStep
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
      title={translate('Atlassian Settings Discovery')}
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
