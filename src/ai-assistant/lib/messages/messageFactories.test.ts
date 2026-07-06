import { AppendMessage } from '@assistant-ui/react';
import { describe, expect, it } from 'vitest';

import { getMessageText } from './messageFactories';

describe('getMessageText', () => {
  it('returns the text of a text message', () => {
    const message = {
      content: [{ type: 'text', text: 'find GPUs' }],
    } as unknown as AppendMessage;
    expect(getMessageText(message)).toBe('find GPUs');
  });

  it('throws when the first part is not text', () => {
    const message = {
      content: [{ type: 'image', image: 'x' }],
    } as unknown as AppendMessage;
    expect(() => getMessageText(message)).toThrow(/text messages/);
  });
});
