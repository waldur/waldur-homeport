export interface MentionCandidate {
  userId: string;
  displayName: string;
}

export interface TextContent {
  msgtype: string;
  body: string;
  format?: string;
  formatted_body?: string;
  'm.mentions'?: { user_ids?: string[] };
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Content of a text message, with mention pills (org.matrix.msc3952) for the
 * `@Display Name` mentions of `members` it contains.
 */
export function buildTextContent(
  text: string,
  members: MentionCandidate[],
  msgtype = 'm.text',
): TextContent {
  // Escape first so message text can't inject HTML, then sort members
  // longest-name-first so "@Alice Smith" is matched before "@Alice" and
  // isn't corrupted by the shorter prefix.
  const mentionedUserIds: string[] = [];
  let htmlBody = escapeHtml(text);

  const sortedMembers = [...members].sort(
    (a, b) => b.displayName.length - a.displayName.length,
  );
  for (const member of sortedMembers) {
    const mentionText = `@${member.displayName}`;
    if (text.includes(mentionText)) {
      const pattern = new RegExp(escapeRegExp(escapeHtml(mentionText)), 'g');
      const replaced = htmlBody.replace(
        pattern,
        `<a href="https://matrix.to/#/${encodeURIComponent(member.userId)}">${escapeHtml(member.displayName)}</a>`,
      );
      // Only register the user_id mention if the replacement actually
      // fired. Names with characters that escape away (e.g. raw "<")
      // would otherwise be listed in m.mentions without appearing in
      // the body — receivers would silently ping the wrong people.
      if (replaced !== htmlBody) {
        mentionedUserIds.push(member.userId);
        htmlBody = replaced;
      }
    }
  }

  if (mentionedUserIds.length === 0) return { msgtype, body: text };
  return {
    msgtype,
    body: text,
    format: 'org.matrix.custom.html',
    formatted_body: htmlBody,
    'm.mentions': { user_ids: mentionedUserIds },
  };
}

/**
 * The fields that make a message a rich reply to `parentEventId`. No quote
 * fallback is put in the body (the spec dropped it); the parent's sender is
 * mentioned so they are notified, unless they are the one replying.
 */
export function buildReplyFields(
  parentEventId: string,
  parentSender: string,
  myUserId: string | null,
  mentioned: string[] = [],
) {
  const userIds = new Set(mentioned);
  if (parentSender && parentSender !== myUserId) userIds.add(parentSender);
  return {
    'm.mentions': { user_ids: [...userIds] },
    'm.relates_to': { 'm.in_reply_to': { event_id: parentEventId } },
  };
}

/** A text message as a rich reply; see {@link buildReplyFields}. */
export function buildReplyContent(
  content: TextContent,
  parentEventId: string,
  parentSender: string,
  myUserId: string | null,
) {
  return {
    ...content,
    ...buildReplyFields(
      parentEventId,
      parentSender,
      myUserId,
      content['m.mentions']?.user_ids,
    ),
  };
}

/** `content` with `userIds` added to its mentions. */
export function withMentions(
  content: TextContent,
  userIds: string[],
): TextContent {
  if (!userIds.length) return content;
  const all = new Set([...(content['m.mentions']?.user_ids ?? []), ...userIds]);
  return { ...content, 'm.mentions': { user_ids: [...all] } };
}

/**
 * An edit (m.replace) of `originalEventId`. The top level is the fallback
 * shown by clients without edits ("* new text"); m.new_content is what the
 * message becomes. Only people mentioned for the first time are listed at
 * the top level, so an edit doesn't ping everyone the message already did.
 */
export function buildEditContent(
  originalEventId: string,
  newContent: TextContent,
  previouslyMentioned: string[] = [],
) {
  const allMentions = newContent['m.mentions']?.user_ids ?? [];
  const before = new Set(previouslyMentioned);
  const fallback: TextContent = {
    msgtype: newContent.msgtype,
    body: `* ${newContent.body}`,
  };
  if (newContent.formatted_body) {
    fallback.format = newContent.format;
    fallback.formatted_body = `* ${newContent.formatted_body}`;
  }
  return {
    ...fallback,
    'm.mentions': { user_ids: allMentions.filter((id) => !before.has(id)) },
    'm.new_content': {
      ...newContent,
      'm.mentions': { user_ids: allMentions },
    },
    'm.relates_to': { rel_type: 'm.replace', event_id: originalEventId },
  };
}
