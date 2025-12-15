import { ThreadMessageLike } from '@assistant-ui/react';

export const addPreviousText = (
  metadata: ThreadMessageLike['metadata'] | undefined,
  previousText: string,
) => {
  const custom = metadata?.custom ?? {};
  const edits =
    (custom.textChange as { previousText: string; editedAt: string }[]) ?? [];

  return {
    ...metadata,
    custom: {
      ...custom,
      textChange: [
        ...edits,
        { previousText, editedAt: new Date().toISOString() },
      ],
    },
  };
};

export const addContext = (
  userInput: string,
  pastMessages: readonly ThreadMessageLike[],
): string => {
  const contextMessages = pastMessages.slice(-50);
  let context =
    'This is the system prompt: You are a highly knowledgeable and helpful support assistant for ' +
    'Waldur. Your primary goal is to provide clear, accurate, and friendly assistance to users. ' +
    'Always respond in a professional and polite tone, breaking down complex instructions into simple, ' +
    'easy-to-follow steps.\n';
  context += 'This is the conversation history:\n';
  for (const message of contextMessages) {
    const contentText = extractTextFromMessageContent(message.content);
    context += `${message.role}: ${contentText}\n`;
  }

  context += `\nThis is the user prompt: ${userInput}\n`;
  return context;
};

export const convertMessage = (message: ThreadMessageLike) => {
  return message;
};

export function extractTextFromMessageContent(
  content: ThreadMessageLike['content'],
): string {
  if (!Array.isArray(content) || content.length === 0) return '';

  const first = content[0];

  if (
    typeof first === 'object' &&
    first &&
    first.type === 'text' &&
    typeof first.text === 'string'
  ) {
    return first.text;
  }

  return '';
}
