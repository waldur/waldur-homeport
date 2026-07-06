import { AppendMessage, ThreadMessageLike } from '@assistant-ui/react';

import { randomUUID } from '@/core/utils';

/** Read the text of an incoming composer message, or throw if it isn't a text part. */
export const getMessageText = (message: AppendMessage): string => {
  const first = message.content[0];
  if (typeof first !== 'object' || !first || first.type !== 'text') {
    throw new Error('Only text messages are supported');
  }
  return first.text;
};

export const createUserMessage = (text: string): ThreadMessageLike => ({
  id: randomUUID(),
  role: 'user',
  content: [{ type: 'text', text }],
  createdAt: new Date(),
  metadata: {},
});

export const createAssistantPlaceholder = (): ThreadMessageLike => ({
  id: randomUUID(),
  role: 'assistant',
  content: [{ type: 'text', text: '' }],
  createdAt: new Date(),
  metadata: {},
});
