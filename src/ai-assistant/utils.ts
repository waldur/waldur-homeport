import { ENV } from '@waldur/core/config';
import { isFeatureVisible } from '@waldur/features/connect';
import { SupportFeatures } from '@waldur/FeaturesEnums';
import { User } from '@waldur/workspace/types';

type LLMChatEnabledRoles = 'disabled' | 'staff' | 'staff_and_support' | 'all';

/** Read AI_ASSISTANT_ENABLED_ROLES from public configuration */
export const getLLMChatMode = (): LLMChatEnabledRoles =>
  ENV.plugins?.WALDUR_CORE?.AI_ASSISTANT_ENABLED_ROLES ?? 'disabled';

/** Is LLM chat allowed for a specific user based on the setting value? */
export const isLLMChatAllowedForUser = (
  user: User | undefined,
  mode: LLMChatEnabledRoles | undefined,
): boolean => {
  if (!user || !mode) return false;
  if (!isFeatureVisible(SupportFeatures.enable_llm_assistant)) return false;
  switch (mode) {
    case 'disabled':
      return false;
    case 'staff':
      return user.is_staff;
    case 'staff_and_support':
      return user.is_staff || user.is_support;
    case 'all':
      return true;
  }
};
