import { streamChat } from '@waldur/ai-assistant/lib/streaming/streamChat';
import { MessageHandlerDependencies } from '@waldur/ai-assistant/lib/types';
import { translate } from '@waldur/i18n';

export const generateAndSetThreadTitle = async (
  input: string,
  deps: Pick<MessageHandlerDependencies, 'currentThreadId' | 'setThreadList'>,
  signal?: AbortSignal,
  backendThreadUuid?: string,
): Promise<void> => {
  try {
    const titlePrompt =
      "Generate a concise title of max 30 characters for the user's first message summary, and output ONLY the title. User Message:" +
      input;

    const streamInput = streamChat(
      titlePrompt,
      signal,
      null,
      backendThreadUuid,
    );

    let newTitle = '';
    for await (const part of streamInput) {
      if (part.c) {
        newTitle += part.c;
      }
    }

    if (newTitle) {
      // Trim whitespace, remove quotes, and strictly enforce the 30-character limit.
      const finalTitle = newTitle
        .trim()
        .replace(/^['"]|['"]$/g, '')
        .substring(0, 30);

      deps.setThreadList((prev) =>
        prev.map((thread) =>
          thread.id === deps.currentThreadId
            ? { ...thread, title: finalTitle }
            : thread,
        ),
      );
    }
  } catch {
    deps.setThreadList((prev) =>
      prev.map((thread) =>
        thread.id === deps.currentThreadId
          ? { ...thread, title: translate('New Chat') }
          : thread,
      ),
    );
  }
};
