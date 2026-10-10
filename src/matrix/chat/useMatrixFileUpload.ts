import { useCallback, useState } from 'react';

import { translate } from '@/i18n';
import { NotifyService } from '@/store/notify';

import { encryptAttachment } from './attachmentCrypto';
import { useMatrixComposerDraft } from './MatrixComposerDraftContext';
import { AUDIO_TYPES, IMAGE_TYPES, VIDEO_TYPES } from './mediaTypes';
import { parseMxcUrl } from './mxc';
import { withFreshAccessToken } from './session';
import { UploadedMedia } from './types';
import { useMatrixClient } from './useMatrixClient';

function getMsgType(mimeType: string) {
  if (IMAGE_TYPES.includes(mimeType)) return 'm.image';
  if (VIDEO_TYPES.includes(mimeType)) return 'm.video';
  if (AUDIO_TYPES.includes(mimeType)) return 'm.audio';
  return 'm.file';
}

function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

// Why an upload to this room must wait, or null if it may proceed. A room the
// client hasn't synced yet may be encrypted, so it is refused rather than guessed.
const uploadRefusal = (room: any): string | null =>
  room
    ? null
    : translate('The conversation is still loading. Try again shortly.');

const upload = async (
  client: any,
  body: Blob,
  opts: Record<string, unknown>,
): Promise<string> => {
  const uploadResponse: any = await withFreshAccessToken(client, () =>
    client.uploadContent(body, opts),
  );
  const mxcUrl =
    typeof uploadResponse === 'string'
      ? uploadResponse
      : uploadResponse?.content_uri;
  // Embedded in the event as is, so it must be one receivers can fetch.
  if (!parseMxcUrl(mxcUrl))
    throw new Error('Invalid content_uri in upload response');
  return mxcUrl;
};

// Mirrors how matrix-js-sdk decides to encrypt the event itself: the state
// event, or the crypto store's memory of it, which a homeserver that drops or
// resets the state event cannot erase.
const isRoomEncrypted = async (
  client: any,
  room: any,
  roomId: string,
): Promise<boolean> =>
  Boolean(room.hasEncryptionStateEvent?.()) ||
  Boolean(await client.getCrypto?.()?.isEncryptionEnabledInRoom(roomId));

// In an encrypted room the homeserver gets only ciphertext, with no name and
// no type; both travel inside the encrypted event instead.
const uploadMedia = async (
  client: any,
  file: File,
  encrypted: boolean,
): Promise<UploadedMedia> => {
  if (!encrypted) {
    return {
      url: await upload(client, file, { name: file.name, type: file.type }),
    };
  }
  const { ciphertext, file: encryptedFile } = await encryptAttachment(
    await file.arrayBuffer(),
  );
  const url = await upload(client, new Blob([ciphertext]), {
    type: 'application/octet-stream',
    includeFilename: false,
  });
  return { file: { ...encryptedFile, url } };
};

/**
 * Stages files for upload and posts them to the active room on demand. The
 * attach button and the chat panel's drag-and-drop both feed the same pending
 * queue, so files are previewed and only sent when the user submits — never
 * the instant they're picked.
 */
export function useMatrixFileUpload() {
  const { client, activeRoomId } = useMatrixClient();
  const { draft, setFiles } = useMatrixComposerDraft(activeRoomId);
  const [uploading, setUploading] = useState(false);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length) setFiles((prev) => [...prev, ...files]);
    },
    [setFiles],
  );

  const removePending = useCallback(
    (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [setFiles],
  );

  const setPending = useCallback(
    (files: File[]) => setFiles(() => files),
    [setFiles],
  );

  const clearPending = useCallback(() => setFiles(() => []), [setFiles]);

  const uploadFile = useCallback(
    async (
      file: File,
      // Lets callers (voice messages) override the default file content with
      // custom event fields — e.g. the MSC3245 `m.audio` + waveform payload.
      // `buildContent` receives the freshly uploaded media (a `url`, or an
      // encrypted `file`) so the caller doesn't have to upload separately.
      buildContent?: (media: UploadedMedia) => Record<string, any>,
      // Fields added to the event content, such as the relation that makes it
      // a reply. They go into the content the SDK encrypts, next to `file`.
      extraContent?: Record<string, any>,
    ): Promise<boolean> => {
      if (!file || !client || !activeRoomId) return false;
      const room = client.getRoom?.(activeRoomId);
      const refusal = uploadRefusal(room);
      if (refusal) {
        NotifyService.error(refusal);
        return false;
      }

      setUploading(true);
      try {
        const msgtype = getMsgType(file.type);
        // Measured before the upload, so on the usual path nothing is awaited
        // between the last encryption check and sendMessage. The re-upload
        // below does await, but only ever towards encryption, the safe side.
        const dimensions =
          !buildContent && msgtype === 'm.image'
            ? await getImageDimensions(file)
            : null;

        const encrypted = await isRoomEncrypted(client, room, activeRoomId);
        let media = await uploadMedia(client, file, encrypted);
        // The room can turn encrypted while a clear upload is in flight. The
        // event would then be encrypted around a link to a clear file, so the
        // clear copy is left unreferenced and the file goes up encrypted.
        if (!encrypted && (await isRoomEncrypted(client, room, activeRoomId))) {
          media = await uploadMedia(client, file, true);
        }

        if (buildContent) {
          await client.sendMessage(activeRoomId, {
            ...buildContent(media),
            ...extraContent,
          } as any);
          return true;
        }

        const content: Record<string, any> = {
          msgtype,
          body: file.name,
          ...media,
          info: {
            mimetype: file.type,
            size: file.size,
            ...(dimensions && { w: dimensions.width, h: dimensions.height }),
          },
        };

        await client.sendMessage(activeRoomId, {
          ...content,
          ...extraContent,
        } as any);
        return true;
      } catch {
        NotifyService.error(translate('Upload failed.'));
        return false;
      } finally {
        setUploading(false);
      }
    },
    [client, activeRoomId],
  );

  return {
    uploadFile,
    uploading,
    pendingFiles: draft.files,
    addFiles,
    removePending,
    setPending,
    clearPending,
  };
}
