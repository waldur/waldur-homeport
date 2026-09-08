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
  /**
   * Question to prefill the composer with, so an entry point that knows its
   * subject (e.g. an offering page) hands that context to the assistant. Left
   * editable and unsent — the user decides what to ask.
   */
  seedPrompt?: string;
}

type OpenDrawer = ReturnType<typeof useDrawer>['openDrawer'];

/**
 * Single entry point for opening the AI assistant drawer. The class on
 * #kt_drawer and the toolbar must be applied here in the toggle handler,
 * not in component lifecycle — otherwise the slide-in animation runs
 * before the styles are in place.
 */
export const openUnifiedChatDrawer = (
  openDrawer: OpenDrawer,
  options: OpenUnifiedChatDrawerOptions = {},
) => {
  if (options.seedPrompt) {
    setPendingAssistantSeed(options.seedPrompt);
  }
  document.getElementById('kt_drawer')?.classList.add(DRAWER_SHELL_CLASS.ai);
  openDrawer(UnifiedChatDrawer, {
    title: options.title ?? translate('AI assistant'),
    toolbar: LLMChatDrawerToolbar,
    width: '800px',
  });
};
