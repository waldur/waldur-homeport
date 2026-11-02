import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { SupportFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { SettingsDescription } from '@/SettingsDescription';

import { SettingsCard } from '../settings/SettingsCard';

const AI_ASSISTANT_SETTINGS = SettingsDescription.find(
  (group) => group.description === translate('AI assistant settings'),
);

export const AIAssistantSettings = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['AIAssistantSettings'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  // Only show if AI assistant feature is enabled
  if (!isFeatureVisible(SupportFeatures.enable_llm_assistant)) {
    return (
      <AlertItem
        type="floating"
        title={translate('AI Assistant Not Enabled')}
        body={translate(
          'The AI Assistant feature is currently disabled. Enable it in the configuration to access these settings.',
        )}
      />
    );
  }

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred
      message={translate('Unable to load AI Assistant configuration.')}
      loadData={refetch}
    />
  ) : data && AI_ASSISTANT_SETTINGS ? (
    <SettingsCard group={AI_ASSISTANT_SETTINGS} values={data} />
  ) : null;
};
