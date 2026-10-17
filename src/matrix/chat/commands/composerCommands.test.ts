import { describe, expect, it } from 'vitest';

import {
  ComposerCommand,
  filterCommands,
  findCommand,
  getCommandQuery,
  resolveOutgoingText,
} from './composerCommands';

const bot = (
  name: string,
  extra: Partial<ComposerCommand> = {},
): ComposerCommand => ({ name, source: 'bot', available: true, ...extra });

const COMMANDS: ComposerCommand[] = [
  bot('help'),
  bot('status'),
  bot('orders'),
  bot('ticket', { args: '[description]' }),
  bot('ticket send', {
    available: false,
    reason: 'You have no open ticket draft in this room.',
  }),
  bot('ticket cancel', {
    available: false,
    reason: 'You have no open ticket draft in this room.',
  }),
  {
    name: 'call',
    source: 'client',
    available: true,
  },
];

const names = (commands: ComposerCommand[]) => commands.map((c) => c.name);

describe('getCommandQuery', () => {
  it.each([
    ['!', { prefix: '!', query: '' }],
    ['/', { prefix: '/', query: '' }],
    ['!ti', { prefix: '!', query: 'ti' }],
    ['/TI', { prefix: '/', query: 'ti' }],
    ['/ticket  s', { prefix: '/', query: 'ticket s' }],
  ])('opens on %j', (text, expected) => {
    expect(getCommandQuery(text)).toEqual(expected);
  });

  it.each(['', 'hi', '//', ' /x', 'a!b', '!@x', '/a\nb'])(
    'stays closed on %j',
    (text) => {
      expect(getCommandQuery(text)).toBeNull();
    },
  );
});

describe('filterCommands', () => {
  it('lists only available commands after /', () => {
    expect(names(filterCommands(COMMANDS, '', '/'))).toEqual([
      'help',
      'status',
      'orders',
      'ticket',
      'call',
    ]);
  });

  it('lists only the bot’s commands after !, the form the room sees', () => {
    expect(names(filterCommands(COMMANDS, '', '!'))).toEqual([
      'help',
      'status',
      'orders',
      'ticket',
    ]);
    expect(filterCommands(COMMANDS, 'ca', '!')).toEqual([]);
  });

  it('puts prefix matches before other matches', () => {
    expect(names(filterCommands(COMMANDS, 's', '/'))).toEqual([
      'status',
      'orders',
    ]);
  });

  it('matches multi-word names and closes on arguments', () => {
    const withDraft = COMMANDS.map((c) => ({ ...c, available: true }));
    expect(names(filterCommands(withDraft, 'ticket s', '/'))).toEqual([
      'ticket send',
    ]);
    expect(filterCommands(withDraft, 'ticket backups', '/')).toEqual([]);
  });
});

describe('findCommand', () => {
  it.each([
    ['ticket send', 'ticket send'],
    ['Ticket   SEND', 'ticket send'],
    ['ticket cancel', 'ticket cancel'],
    ['ticket sending is broken', 'ticket'],
    // As the bot reads them: a sub-command takes no arguments, so more words
    // make a new draft about them.
    ['ticket send please', 'ticket'],
    ['ticket cancel the old one', 'ticket'],
  ])('reads %j as %j', (text, name) => {
    expect(findCommand(COMMANDS, text)?.name).toBe(name);
  });

  it('finds nothing for a partial name', () => {
    expect(findCommand(COMMANDS, 'tick')).toBeUndefined();
  });
});

describe('resolveOutgoingText', () => {
  it('sends a / bot command in the bot’s ! form', () => {
    expect(
      resolveOutgoingText('/ticket backups are failing', COMMANDS),
    ).toEqual({ kind: 'send', text: '!ticket backups are failing' });
    expect(resolveOutgoingText('/Status', COMMANDS)).toEqual({
      kind: 'send',
      text: '!status',
    });
  });

  it('never sends an unknown / command', () => {
    expect(resolveOutgoingText('/foo bar', COMMANDS)).toEqual({
      kind: 'unknown-command',
      command: 'foo',
    });
    expect(resolveOutgoingText('/ticket x', [])).toEqual({
      kind: 'unknown-command',
      command: 'ticket',
    });
  });

  it('sends a / command in ! form unchecked while the bot’s commands are not loaded', () => {
    const call = COMMANDS[6];
    expect(resolveOutgoingText('/ticket x', [call], false)).toEqual({
      kind: 'send',
      text: '!ticket x',
    });
    expect(resolveOutgoingText('/Help', [], false)).toEqual({
      kind: 'send',
      text: '!Help',
    });
    // Waldur's own commands are known without the list.
    expect(resolveOutgoingText('/call', [call], false)).toEqual({
      kind: 'client-command',
      command: call,
    });
    expect(resolveOutgoingText('/etc/hosts broke', [], false)).toEqual({
      kind: 'send',
      text: '/etc/hosts broke',
    });
  });

  it('never sends an unavailable / command, and says why', () => {
    expect(resolveOutgoingText('/ticket send', COMMANDS)).toEqual({
      kind: 'unavailable-command',
      command: 'ticket send',
      reason: 'You have no open ticket draft in this room.',
    });
  });

  it('sends a sub-command name with more words as a new draft', () => {
    expect(resolveOutgoingText('/ticket send button fails', COMMANDS)).toEqual({
      kind: 'send',
      text: '!ticket send button fails',
    });
  });

  it('runs a client command instead of sending it', () => {
    expect(resolveOutgoingText('/call', COMMANDS)).toEqual({
      kind: 'client-command',
      command: COMMANDS[6],
    });
  });

  it('sends // as a literal leading slash', () => {
    expect(resolveOutgoingText('//etc/hosts is wrong', COMMANDS)).toEqual({
      kind: 'send',
      text: '/etc/hosts is wrong',
    });
  });

  it.each(['/', '/ ok', '/etc/hosts broke', '/1st try', '/:)'])(
    'sends %j as plain text',
    (text) => {
      expect(resolveOutgoingText(text, COMMANDS)).toEqual({
        kind: 'send',
        text,
      });
      expect(resolveOutgoingText(text, [])).toEqual({ kind: 'send', text });
    },
  );

  it('sends ! and other text unchanged', () => {
    expect(resolveOutgoingText('!ticket send', COMMANDS)).toEqual({
      kind: 'send',
      text: '!ticket send',
    });
    expect(resolveOutgoingText('!nope', [])).toEqual({
      kind: 'send',
      text: '!nope',
    });
    expect(resolveOutgoingText('hello', COMMANDS)).toEqual({
      kind: 'send',
      text: 'hello',
    });
  });
});
