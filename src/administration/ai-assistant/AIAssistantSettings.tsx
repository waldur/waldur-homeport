import { AlertItem } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { SupportFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';

import { SettingsTab, SettingsWithTabs } from '../settings/SettingsWithTabs';

export const AI_ASSISTANT_TABS: SettingsTab[] = [
  {
    key: 'general',
    title: translate('General'),
    groupName: translate('AI assistant general'),
  },
  {
    key: 'model',
    title: translate('Model'),
    groupName: translate('AI assistant model'),
  },
  {
    key: 'limits',
    title: translate('Limits'),
    groupName: translate('AI assistant limits'),
  },
  {
    key: 'conversations',
    title: translate('Conversations'),
    groupName: translate('AI assistant conversations'),
  },
  {
    key: 'public-chat',
    title: translate('Public assistant'),
    groupName: translate('AI assistant public chat'),
  },
];

export const AIAssistantSettings = () => {
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

  return (
    <SettingsWithTabs
      title={translate('AI Assistant settings')}
      tabs={AI_ASSISTANT_TABS}
      queryKey="AIAssistantSettings"
    />
  );
};
