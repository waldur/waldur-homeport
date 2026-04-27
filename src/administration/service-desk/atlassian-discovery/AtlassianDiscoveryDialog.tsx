import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { supportSettingsAtlassianCurrentSettingsRetrieve } from 'waldur-js-client';

import { ProgressStep } from '@/core/ProgressSteps';
import { translate } from '@/i18n';
import { Wizard } from '@/wizard';

import { CredentialsStep } from './steps/CredentialsStep';
import { FieldMappingStep } from './steps/FieldMappingStep';
import { PreviewStep } from './steps/PreviewStep';
import { ProjectStep } from './steps/ProjectStep';
import { RequestTypesStep } from './steps/RequestTypesStep';
import type { AtlassianFormValues } from './types';

const steps: ProgressStep[] = [
  { key: 'credentials', label: translate('Credentials'), completed: false },
  { key: 'project', label: translate('Project'), completed: false },
  { key: 'request_types', label: translate('Request Types'), completed: false },
  { key: 'fields', label: translate('Field Mapping'), completed: false },
  { key: 'preview', label: translate('Preview'), completed: false },
];

const wizardForms = [
  CredentialsStep,
  ProjectStep,
  RequestTypesStep,
  FieldMappingStep,
  PreviewStep,
];

/**
 * Atlassian Discovery Wizard - migrated to use unified Wizard component.
 *
 * Key patterns used:
 * - All wizard state stored in React Final Form values
 * - Steps use useForm()/useFormState() to read/write values
 * - Custom renderFooter for step-specific navigation buttons
 * - Async operations (credential validation, API discovery) update form values
 */
export const AtlassianDiscoveryDialog: FC = () => {
  // Load current settings to pre-fill the form
  const { data: currentSettings } = useQuery({
    queryKey: ['AtlassianCurrentSettings'],
    queryFn: () => supportSettingsAtlassianCurrentSettingsRetrieve(),
    staleTime: 0,
  });

  // Build initial values from current settings
  const initialValues = useMemo((): Partial<AtlassianFormValues> => {
    const settings = currentSettings?.data as
      | Record<string, unknown>
      | undefined;

    return {
      // Credentials - pre-fill from existing settings
      api_url: (settings?.ATLASSIAN_API_URL as string) || '',
      auth_method:
        (settings?.auth_method as AtlassianFormValues['auth_method']) ||
        'api_token',
      email: (settings?.ATLASSIAN_EMAIL as string) || '',
      username: (settings?.ATLASSIAN_USERNAME as string) || '',
      verify_ssl: (settings?.ATLASSIAN_VERIFY_SSL as boolean) ?? true,
      // Secrets are not pre-filled for security
      token: '',
      personal_access_token: '',
      password: '',
      credentialsValid: false,

      // Discovery results - initially empty
      projects: [],
      selectedProjectId: null,
      requestTypes: [],
      selectedRequestTypeIds: [],
      customFields: [],
      priorities: [],
      fieldMappings: {},
    };
  }, [currentSettings]);

  // The actual save happens in PreviewStep, so onSubmit is a no-op
  const handleSubmit = useCallback(() => {
    // Final submission is handled by PreviewStep's save button
    return Promise.resolve();
  }, []);

  // Custom footer - each step has different buttons
  // Footer is rendered by each step component since they have
  // step-specific buttons and async validation logic
  const renderFooter = useCallback(() => null, []);

  return (
    <Wizard<AtlassianFormValues>
      title={translate('Atlassian Settings Discovery')}
      subtitle={translate('Configure Atlassian Jira Service Desk integration')}
      steps={steps}
      wizardForms={wizardForms}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      renderFooter={renderFooter}
      modalProps={{ bodyClassName: 'p-0' }}
    />
  );
};
