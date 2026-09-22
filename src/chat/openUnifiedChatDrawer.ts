import { LLMChatDrawerToolbar } from '@/ai-assistant/components/LLMChatDrawer';
import { setPendingAssistantSeed } from '@/ai-assistant/logic/assistantSeed';
import { lazyComponent } from '@/core/lazyComponent';
import { useDrawer } from '@/drawer/actions';
import { DRAWER_SHELL_CLASS } from '@/drawer/shellClasses';
import { translate } from '@/i18n';

const UnifiedChatDrawer = lazyComponent(() =>
  import('@/chat/UnifiedChatDrawer').then((m) => ({
    default: m.UnifiedChatDrawer,
  })),
);

interface OpenUnifiedChatDrawerOptions {
  title?: string;
  /** Question to prefill the composer with. Left editable and unsent. */
  seedPrompt?: string;
}

type OpenDrawer = ReturnType<typeof useDrawer>['openDrawer'];

/**
 * Single entry point for opening the AI assistant drawer. The shell class and
 * toolbar go in with the open, not from the panel's lifecycle — the panel is
 * lazy, and the slide-in would otherwise start before its styles are in place.
 */
export const openUnifiedChatDrawer = (
  openDrawer: OpenDrawer,
  options: OpenUnifiedChatDrawerOptions = {},
) => {
  if (options.seedPrompt) {
    setPendingAssistantSeed(options.seedPrompt);
  }
  openDrawer(UnifiedChatDrawer, {
    title: options.title ?? translate('AI assistant'),
    toolbar: LLMChatDrawerToolbar,
    width: '800px',
    shellClass: DRAWER_SHELL_CLASS.ai,
  });
};
