import { streamChat } from '@waldur/ai-assistant/lib/streaming/streamChat';
import { MessageHandlerDependencies } from '@waldur/ai-assistant/lib/types';

export const generateAndSetThreadTitle = async (
  input: string,
  deps: Pick<MessageHandlerDependencies, 'currentThreadId' | 'setThreadList'>,
): Promise<void> => {
  const titleAbortController = new AbortController();

  try {
    const titlePrompt =
      "Generate a concise title of max 30 characters for the user's first message summary, and output ONLY the title. User Message:" +
      input;

    const streamInput = streamChat(titlePrompt, titleAbortController.signal);

    let newTitle = '';
    for await (const part of streamInput) {
      if (part.content) {
        newTitle += part.content;
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
          ? { ...thread, title: 'New Chat' }
          : thread,
      ),
    );
  }
};
