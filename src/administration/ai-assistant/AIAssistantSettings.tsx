import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { SupportFeatures } from '@waldur/FeaturesEnums';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { SettingsDescription } from '@waldur/SettingsDescription';

import { FieldRow } from '../settings/FieldRow';

const AI_ASSISTANT_SETTINGS = SettingsDescription.find(
  (group) => group.description === translate('AI assistant settings'),
);

const SettingsGroupCard = ({ group, data }) => {
  if (!group) return null;

  return (
    <FormTable.Card
      title={group.description}
      key={group.description}
      className="card-bordered mb-5"
    >
      <FormTable>
        {group.items.map((item) => (
          <FieldRow item={item} value={data[item.key]} key={item.key} />
        ))}
      </FormTable>
    </FormTable.Card>
  );
};

export const AIAssistantSettings = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['AIAssistantSettings'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  // Only show if AI assistant feature is enabled
  if (!isFeatureVisible(SupportFeatures.enable_llm_assistant)) {
    return (
      <div className="alert alert-info">
        <h4>{translate('AI Assistant Not Enabled')}</h4>
        <p>
          {translate(
            'The AI Assistant feature is currently disabled. Enable it in the configuration to access these settings.',
          )}
        </p>
      </div>
    );
  }

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred
      message={translate('Unable to load AI Assistant configuration.')}
      loadData={refetch}
    />
  ) : data ? (
    <SettingsGroupCard group={AI_ASSISTANT_SETTINGS} data={data} />
  ) : null;
};
