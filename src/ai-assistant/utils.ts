import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { SupportFeatures } from '@/FeaturesEnums';
import { User } from '@/workspace/types';

type LLMChatEnabledRoles =
  'disabled' | 'staff' | 'staff_and_support' | 'all' | 'anonymous';

const DISCLOSURE_KEY = 'waldur/ai-assistant/disclosure-acknowledged';

export const isDisclosureAcknowledged = (): boolean =>
  localStorage.getItem(DISCLOSURE_KEY) === 'true';

export const acknowledgeDisclosure = (): void =>
  localStorage.setItem(DISCLOSURE_KEY, 'true');

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
    case 'anonymous':
      // 'anonymous' is a superset of 'all': every authenticated user gets the
      // full assistant. The guard above already excluded the no-user case, which
      // is routed to the visitor panel via isAnonymousAssistantEnabled() instead.
      return true;
  }
};

/**
 * Anonymous marketplace assistant — gated on the public config mode + feature
 * flag, independent of any user. Drives the standalone visitor panel only;
 * logged-in users in 'anonymous' mode are routed to the full authenticated
 * assistant (see isLLMChatAllowedForUser), since 'anonymous' is a superset of 'all'.
 */
export const isAnonymousAssistantEnabled = (): boolean =>
  getLLMChatMode() === 'anonymous' &&
  isFeatureVisible(SupportFeatures.enable_llm_assistant);

/**
 * A logged-out visitor who should get the standalone anonymous panel: no user
 * AND anonymous mode is on. A logged-in user always gets the full authenticated
 * assistant instead (see isLLMChatAllowedForUser). Shared by the drawer branch
 * and the drawer toolbar so they can't disagree on who is a visitor.
 */
export const isAnonymousVisitor = (user: User | undefined): boolean =>
  !user && isAnonymousAssistantEnabled();

/** True when either the authenticated assistant (for this user) or the anonymous assistant is available. */
export const isAssistantEnabled = (user: User | undefined): boolean =>
  isLLMChatAllowedForUser(user, getLLMChatMode()) ||
  isAnonymousAssistantEnabled();
