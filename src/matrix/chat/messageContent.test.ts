import { describe, expect, it } from 'vitest';

import {
  buildEditContent,
  buildReplyContent,
  buildTextContent,
} from './messageContent';

const members = [
  { userId: '@alice:s', displayName: 'Alice Smith' },
  { userId: '@bob:s', displayName: 'Bob' },
];

describe('buildTextContent', () => {
  it('sends plain text without mentions as is', () => {
    expect(buildTextContent('hello', members)).toEqual({
      msgtype: 'm.text',
      body: 'hello',
    });
  });

  it('turns mentions into pills and lists them', () => {
    const content = buildTextContent('hi @Alice Smith <b>', members);
    expect(content['m.mentions']).toEqual({ user_ids: ['@alice:s'] });
    expect(content.formatted_body).toBe(
      'hi <a href="https://matrix.to/#/%40alice%3As">Alice Smith</a> &lt;b&gt;',
    );
  });
});

describe('buildReplyContent', () => {
  it('relates the reply to its parent and mentions the parent sender', () => {
    const content = buildReplyContent(
      buildTextContent('sure', members),
      '$parent',
      '@bob:s',
      '@me:s',
    );
    expect(content).toEqual({
      msgtype: 'm.text',
      body: 'sure',
      'm.mentions': { user_ids: ['@bob:s'] },
      'm.relates_to': { 'm.in_reply_to': { event_id: '$parent' } },
    });
  });

  it('does not mention the user replying to themselves', () => {
    const content = buildReplyContent(
      buildTextContent('also', members),
      '$parent',
      '@me:s',
      '@me:s',
    );
    expect(content['m.mentions']).toEqual({ user_ids: [] });
  });
});

describe('buildEditContent', () => {
  it('replaces the message with new content and a fallback body', () => {
    const content = buildEditContent(
      '$orig',
      buildTextContent('fixed', members),
    );
    expect(content).toEqual({
      msgtype: 'm.text',
      body: '* fixed',
      'm.mentions': { user_ids: [] },
      'm.new_content': {
        msgtype: 'm.text',
        body: 'fixed',
        'm.mentions': { user_ids: [] },
      },
      'm.relates_to': { rel_type: 'm.replace', event_id: '$orig' },
    });
  });

  it('pings only people the edit mentions for the first time', () => {
    const content = buildEditContent(
      '$orig',
      buildTextContent('@Alice Smith and @Bob', members),
      ['@alice:s'],
    );
    expect(content['m.mentions']).toEqual({ user_ids: ['@bob:s'] });
    expect(content['m.new_content']['m.mentions']).toEqual({
      user_ids: ['@alice:s', '@bob:s'],
    });
    expect(content.formatted_body?.startsWith('* ')).toBe(true);
  });

  it('keeps the message type, so an emote stays an emote', () => {
    const content = buildEditContent(
      '$orig',
      buildTextContent('waves', [], 'm.emote'),
    );
    expect(content.msgtype).toBe('m.emote');
    expect(content['m.new_content'].msgtype).toBe('m.emote');
  });
});
