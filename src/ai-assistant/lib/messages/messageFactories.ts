import { ThreadMessageLike } from '@assistant-ui/react';

import { randomUUID } from '@/core/utils';

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
