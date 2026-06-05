import { LLMChatDrawerToolbar } from '@/ai-assistant/components/LLMChatDrawer';
import { lazyComponent } from '@/core/lazyComponent';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';

const UnifiedChatDrawer = lazyComponent(() =>
  import('@/chat/UnifiedChatDrawer').then((m) => ({
    default: m.UnifiedChatDrawer,
  })),
);

interface OpenUnifiedChatDrawerOptions {
  defaultRoomUuid?: string;
  matrixRoomAlias?: string | null;
  title?: string;
}

type OpenDrawer = ReturnType<typeof useDrawer>['openDrawer'];

/**
 * Single entry point for opening the unified chat drawer. The class on
 * #kt_drawer and the toolbar must be applied here in the toggle handler,
 * not in component lifecycle — otherwise the slide-in animation runs
 * before the styles are in place.
 */
export const openUnifiedChatDrawer = (
  openDrawer: OpenDrawer,
  options: OpenUnifiedChatDrawerOptions = {},
) => {
  document.getElementById('kt_drawer')?.classList.add('ai-chat-drawer-active');
  openDrawer(UnifiedChatDrawer, {
    title: options.title ?? translate('Chat'),
    toolbar: LLMChatDrawerToolbar,
    width: '800px',
    defaultRoomUuid: options.defaultRoomUuid,
    matrixRoomAlias: options.matrixRoomAlias ?? undefined,
  });
};
