import { useCallback, useState } from 'react';

import { translate } from '@/i18n';
import { NotifyService } from '@/store/notify';

import { useMatrixComposerDraft } from './MatrixComposerDraftContext';
import { AUDIO_TYPES, IMAGE_TYPES, VIDEO_TYPES } from './mediaTypes';
import { withFreshAccessToken } from './session';
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

/**
 * Stages files for upload and posts them to the active room on demand. The
 * attach button and the chat panel's drag-and-drop both feed the same pending
 * queue, so files are previewed and only sent when the user submits — never
 * the instant they're picked.
 */
// Why an upload to this room must wait, or null if it may proceed. A room the
// client hasn't synced yet may be encrypted, so it is refused rather than guessed.
const uploadRefusal = (client: any, roomId: string): string | null => {
  const room = client.getRoom?.(roomId);
  if (!room) {
    return translate('The conversation is still loading. Try again shortly.');
  }
  if (room.hasEncryptionStateEvent?.()) {
    return translate('Files cannot be shared in encrypted conversations yet.');
  }
  return null;
};

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
      // Lets callers (voice messages) supply the resolved mxc URL and override
      // the default file content with custom event fields — e.g. the MSC3245
      // `m.audio` + waveform payload. `buildContent` receives the freshly
      // uploaded mxc URL so the caller doesn't have to upload separately.
      buildContent?: (mxcUrl: string) => Record<string, any>,
    ): Promise<boolean> => {
      if (!file || !client || !activeRoomId) return false;
      // Attachments are not encrypted yet: uploading one to an encrypted room
      // would leave the file readable on the homeserver. Refused before any
      // byte is sent.
      const refusal = uploadRefusal(client, activeRoomId);
      if (refusal) {
        NotifyService.error(refusal);
        return false;
      }

      setUploading(true);
      try {
        const uploadResponse: any = await withFreshAccessToken(client, () =>
          (client as any).uploadContent(file, {
            name: file.name,
            type: file.type,
          }),
        );
        const mxcUrl =
          typeof uploadResponse === 'string'
            ? uploadResponse
            : uploadResponse?.content_uri;

        if (!mxcUrl) throw new Error('No content_uri in upload response');

        if (buildContent) {
          await client.sendMessage(activeRoomId, buildContent(mxcUrl) as any);
          return true;
        }

        const msgtype = getMsgType(file.type);
        const content: Record<string, any> = {
          msgtype,
          body: file.name,
          url: mxcUrl,
          info: {
            mimetype: file.type,
            size: file.size,
          },
        };

        if (msgtype === 'm.image') {
          const dimensions = await getImageDimensions(file);
          if (dimensions) {
            content.info.w = dimensions.width;
            content.info.h = dimensions.height;
          }
        }

        await client.sendMessage(activeRoomId, content as any);
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
