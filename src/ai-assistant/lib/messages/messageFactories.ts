import { ThreadMessageLike } from '@assistant-ui/react';

export const createUserMessage = (text: string): ThreadMessageLike => ({
  id: crypto.randomUUID(),
  role: 'user',
  content: [{ type: 'text', text }],
  createdAt: new Date(),
  metadata: {},
});

export const createAssistantPlaceholder = (): ThreadMessageLike => ({
  id: crypto.randomUUID(),
  role: 'assistant',
  content: [{ type: 'text', text: '' }],
  createdAt: new Date(),
  metadata: {},
});
