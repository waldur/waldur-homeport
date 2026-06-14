import { useCallback, useState } from 'react';

import { translate } from '@/i18n';
import { NotifyService } from '@/store/notify';

import { useMatrixComposerDraft } from './MatrixComposerDraftContext';
import { useMatrixClient } from './useMatrixClient';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'];

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
    async (file: File): Promise<boolean> => {
      if (!file || !client || !activeRoomId) return false;

      setUploading(true);
      try {
        const uploadResponse = await (client as any).uploadContent(file, {
          name: file.name,
          type: file.type,
        });
        const mxcUrl =
          typeof uploadResponse === 'string'
            ? uploadResponse
            : uploadResponse?.content_uri;

        if (!mxcUrl) throw new Error('No content_uri in upload response');

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
