/**
 * A command offered in the composer. Bot commands are sent to the room as
 * text in the bot's own `!` form; client commands act in Waldur and send
 * nothing.
 */
export interface ComposerCommand {
  /** The command without its prefix: `ticket`, or `ticket send`. */
  name: string;
  description?: string;
  /** What follows the command, e.g. `[description]`. */
  args?: string;
  source: 'bot' | 'client';
  /** The command would work for this user in this room now. */
  available: boolean;
  /** Why it would not, when unavailable. */
  reason?: string;
}

const COMMAND_WORD = /^[a-z][\w-]*$/i;

/** The prefixes that open the command menu. */
export type CommandPrefix = '!' | '/';

/** The bot's own command prefix: what the room and the bot always see. */
export const BOT_PREFIX = '!';

interface CommandQuery {
  prefix: CommandPrefix;
  query: string;
}

/**
 * The command being typed, while the whole text is a prefix and what may
 * still be a command name. `//` is the escape for text that starts with a
 * slash and never opens the menu.
 */
export function getCommandQuery(text: string): CommandQuery | null {
  const match = /^([!/])([^\n!/@]*)$/.exec(text);
  if (!match) return null;
  return {
    prefix: match[1] as CommandPrefix,
    query: match[2].replace(/\s+/g, ' ').toLowerCase(),
  };
}

/**
 * The available commands matching `query`: those starting with it first,
 * then, while it is one word, those containing it. Arguments typed after a
 * full command match nothing, which closes the menu. After `!`, which goes to
 * the room as typed, only the bot's commands: a client command is `/` only.
 */
export function filterCommands(
  commands: ComposerCommand[],
  query: string,
  prefix: CommandPrefix,
): ComposerCommand[] {
  const available = commands.filter(
    (c) => c.available && (prefix === '/' || c.source === 'bot'),
  );
  const name = (c: ComposerCommand) => c.name.toLowerCase();
  const starts = available.filter((c) => name(c).startsWith(query));
  const contains = query.includes(' ')
    ? []
    : available.filter(
        (c) => !name(c).startsWith(query) && name(c).includes(query),
      );
  return [...starts, ...contains];
}

/**
 * The command `text` (without its prefix) invokes, as the bot reads it: the
 * whole text when it is a command's name, such as `ticket send`, else the
 * command its first word names. A sub-command takes no arguments, so
 * `ticket send button fails` is a new draft about a send button.
 */
export function findCommand(
  commands: ComposerCommand[],
  text: string,
): ComposerCommand | undefined {
  const typed = text.replace(/\s+/g, ' ').trim().toLowerCase();
  const named = (name: string) =>
    commands.find((c) => c.name.toLowerCase() === name);
  return named(typed) ?? named(typed.split(' ')[0]);
}

type OutgoingText =
  | { kind: 'send'; text: string }
  | { kind: 'client-command'; command: ComposerCommand }
  | { kind: 'unknown-command'; command: string }
  | { kind: 'unavailable-command'; command: string; reason?: string };

/**
 * What the composer does with `text`. A `/` command goes out in the bot's
 * `!` form, or runs in Waldur for a client command. An unknown or
 * unavailable one is never sent, so a mistyped command can't leak into the
 * room as a message. `//` escapes a literal leading slash, and a lone `/` is
 * plain text. Anything else, `!` commands included, is sent as typed: the
 * bot answers those itself.
 *
 * Until the bot's commands are loaded (`botCommandsLoaded`), a `/` command
 * Waldur doesn't know goes out in `!` form unchecked, as the bot answers an
 * unknown one itself: a slow or failed list must not block `/help`.
 */
export function resolveOutgoingText(
  text: string,
  commands: ComposerCommand[],
  botCommandsLoaded = true,
): OutgoingText {
  if (!text.startsWith('/')) return { kind: 'send', text };
  if (text.startsWith('//')) return { kind: 'send', text: text.slice(1) };
  const rest = text.slice(1);
  // Only a word that looks like a command is one: `/etc/hosts broke` and
  // `/ ok` are plain text.
  const word = rest.split(/\s/)[0];
  if (!COMMAND_WORD.test(word)) return { kind: 'send', text };
  const command = findCommand(commands, rest);
  if (!command) {
    return botCommandsLoaded
      ? { kind: 'unknown-command', command: word }
      : { kind: 'send', text: `${BOT_PREFIX}${rest}` };
  }
  if (!command.available) {
    return {
      kind: 'unavailable-command',
      command: command.name,
      reason: command.reason,
    };
  }
  if (command.source === 'client') return { kind: 'client-command', command };
  // The canonical name, then the arguments as typed.
  const words = command.name.split(' ').length;
  const args = rest.replace(new RegExp(`^(\\S+\\s*){${words}}`), '');
  return {
    kind: 'send',
    text: `${BOT_PREFIX}${command.name}${args ? ` ${args}` : ''}`,
  };
}
