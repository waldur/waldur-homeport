// TODO: Switch to proper configuration lookup. WAL-9508

import { useQuery } from '@tanstack/react-query';
//import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LLMSettings } from '@waldur/ai-assistant/lib/types';
//import { translate } from '@waldur/i18n';
//import { SettingsDescription } from '@waldur/SettingsDescription';

// const llmKeys =
//   SettingsDescription.find(
//     (group) => group.description === translate('LLM inference settings'),
//   )?.items.map((item) => item.key) ?? [];

const fallbackLLMSettings: LLMSettings = {
  LLM_CHAT_ENABLED: false,
  LLM_INFERENCES_BACKEND_TYPE: 'ollama',
  LLM_INFERENCES_API_URL: '',
  LLM_INFERENCES_API_TOKEN: '',
  LLM_INFERENCES_MODEL: 'gemma3:27b',
};

export const useLLMSettings = () => {
  return useQuery({
    queryKey: ['AIAssistantSettings'],
    queryFn: () => {
      return fallbackLLMSettings;
      // try {
      //   const { data } = await overrideSettingsRetrieve();
      //
      //   const llmValues = {} as LLMSettings;
      //
      //   llmKeys.forEach((key) => {
      //     llmValues[key] = data[key];
      //   });
      //
      //   return llmValues;
      // } catch {
      //   return fallbackLLMSettings;
      // }
    },
    staleTime: 5 * 60 * 1000,
  });
};
