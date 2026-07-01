/**
 * Pure classification of a room's last timeline event into a structured
 * conversation-list preview. Kept free of matrix-js-sdk and React types so it
 * is unit-testable and shared by the drawer, dock and full-page layouts.
 *
 * Why structured (not just a flat string): file/image/voice previews need an
 * icon plus a formatted size in the row, and system events (e.g. a member
 * invite) read as descriptive text rather than a message body. A single
 * flattened string can't carry that, so the renderer needs the kind alongside
 * the text/filename/size.
 */
import { translate } from '@/i18n';

import { htmlToPlainText } from './utils';

export type PreviewKind =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'file'
  | 'system'
  // Event types we never surface as a preview (state churn, topic, etc.).
  | 'none';

export interface PreviewInfo {
  kind: PreviewKind;
  /** Display text: the message body, or the system-event sentence. */
  text: string;
  fileName?: string;
  fileSize?: number;
}

/** Extra context a state event needs to phrase its system line. */
export interface MembershipContext {
  prevMembership?: string;
  targetName?: string;
}

const MEDIA_MSGTYPES: Record<string, PreviewKind> = {
  'm.image': 'image',
  'm.sticker': 'image',
  'm.video': 'video',
  'm.audio': 'audio',
  'm.file': 'file',
};

function classifyMessage(content: any): PreviewInfo {
  const msgtype: string = content.msgtype ?? 'm.text';
  const mediaKind = MEDIA_MSGTYPES[msgtype];

  if (mediaKind) {
    // MSC3245 marks an m.audio clip as a voice note — surface a distinct
    // "Voice message" preview with a mic icon instead of the raw filename.
    const isVoice =
      mediaKind === 'audio' &&
      content['org.matrix.msc3245.voice'] !== undefined;
    const size =
      typeof content.info?.size === 'number' ? content.info.size : undefined;
    return {
      kind: isVoice ? 'voice' : mediaKind,
      text: content.body ?? '',
      fileName: content.body ?? '',
      fileSize: size,
    };
  }

  // Prefer the rendered HTML flattened to text so previews don't show raw
  // markdown (`**bold**`, backticks); fall back to the plaintext body.
  const text =
    content.format === 'org.matrix.custom.html' &&
    typeof content.formatted_body === 'string'
      ? htmlToPlainText(content.formatted_body)
      : (content.body ?? '');
  return { kind: 'text', text };
}

function classifyMembership(content: any, ctx: MembershipContext): PreviewInfo {
  const name = ctx.targetName || content.displayname || translate('a member');
  const membership: string | undefined = content.membership;

  // Only the transition to "invite" reads as an invitation; joins/leaves are
  // noisy and the mockup only shows the invite line. Other transitions fall
  // through to a generic membership-update line.
  if (membership === 'invite' && ctx.prevMembership !== 'invite') {
    return {
      kind: 'system',
      text: translate('Invited {name} to the team', { name }),
    };
  }
  if (membership === 'join' && ctx.prevMembership !== 'join') {
    return {
      kind: 'system',
      text: translate('{name} joined the team', { name }),
    };
  }
  if (membership === 'leave') {
    return {
      kind: 'system',
      text: translate('{name} left the team', { name }),
    };
  }
  return { kind: 'none', text: '' };
}

export function classifyPreviewEvent(
  eventType: string,
  content: any,
  membershipContext?: MembershipContext,
): PreviewInfo {
  if (!content) return { kind: 'none', text: '' };
  if (eventType === 'm.room.message') return classifyMessage(content);
  if (eventType === 'm.room.member') {
    return classifyMembership(content, membershipContext ?? {});
  }
  return { kind: 'none', text: '' };
}
