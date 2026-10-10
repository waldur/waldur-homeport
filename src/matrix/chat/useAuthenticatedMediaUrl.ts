import { useEffect, useRef, useState } from 'react';

import { decryptAttachment, EncryptedFile } from './attachmentCrypto';
import { inlineSafeType } from './mediaTypes';
import { parseMxcUrl } from './mxc';
import { withFreshAccessToken } from './session';
import { MatrixChatMessage } from './types';
import { useMatrixClient } from './useMatrixClient';

/** The download failed, was refused, or was too large to hold in memory. */
export const MEDIA_UNAVAILABLE = '__matrix_media_unavailable__';
/** An encrypted attachment that failed validation, its hash or decryption. */
export const MEDIA_UNVERIFIED = '__matrix_media_unverified__';

// A chat attachment is held whole in memory (twice while it is decrypted), so
// anything larger than a homeserver would normally accept is refused.
const MAX_MEDIA_BYTES = 100 * 1024 * 1024;

class MediaUnverifiedError extends Error {}

// Counts the bytes as they arrive, so a homeserver that omits or understates
// Content-Length still can't make the page buffer more than the cap.
const readBounded = async (
  res: Response,
  signal: AbortSignal,
): Promise<Blob> => {
  const declared = Number(res.headers?.get?.('Content-Length') ?? 0);
  if (declared > MAX_MEDIA_BYTES) throw new Error('Attachment too large');
  const type = res.headers?.get?.('Content-Type') ?? '';
  const reader = res.body?.getReader?.();
  if (!reader) {
    const blob = await res.blob();
    if (blob.size > MAX_MEDIA_BYTES) throw new Error('Attachment too large');
    return blob;
  }
  // Stop reading once the message is gone, whatever the body is backed by.
  const stop = () => reader.cancel().catch(() => undefined);
  signal.addEventListener('abort', stop, { once: true });
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    signal.throwIfAborted();
    total += value.byteLength;
    if (total > MAX_MEDIA_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new Error('Attachment too large');
    }
    chunks.push(value as Uint8Array<ArrayBuffer>);
  }
  return new Blob(chunks, { type });
};

/**
 * Fetch media via the Matrix client's authenticated endpoint and return a
 * blob URL that can be used in <img>, <video>, <audio> src attributes. An
 * encrypted attachment is checked against its hash and decrypted first.
 *
 * Returns `null` while loading, `MEDIA_UNAVAILABLE` if the fetch failed and
 * `MEDIA_UNVERIFIED` if an encrypted attachment can't be trusted, so the
 * renderer can surface a placeholder instead of leaking the mxc to an
 * unauthenticated URL that bypasses the access check.
 */
export function useAuthenticatedMediaUrl(
  message: Pick<MatrixChatMessage, 'url' | 'file' | 'fileInvalid' | 'info'>,
) {
  const { client } = useMatrixClient();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Messages are rebuilt on every timeline change, so the effect keys on
  // strings and reads the file object from a ref.
  const fileRef = useRef<EncryptedFile | undefined>(message.file);
  fileRef.current = message.file;
  const mxcUrl = message.file?.url ?? message.url;
  const fileHash = message.file?.hashes.sha256;
  // info comes from the event as sent, so its mimetype may not be a string.
  const mimetype =
    typeof message.info?.mimetype === 'string' ? message.info.mimetype : '';
  const fileInvalid = message.fileInvalid;

  useEffect(() => {
    if (fileInvalid) {
      setBlobUrl(MEDIA_UNVERIFIED);
      return () => setBlobUrl(null);
    }
    if (!mxcUrl || !client) return;

    let revoked = false;
    let created: string | null = null;
    // Unmounting or switching media aborts the download instead of letting
    // it run to the end for a message no longer shown.
    const controller = new AbortController();
    const parsed = parseMxcUrl(mxcUrl);
    if (!parsed) {
      setBlobUrl(MEDIA_UNAVAILABLE);
      return () => setBlobUrl(null);
    }

    const { serverName, mediaId } = parsed;
    const baseUrl =
      (client as any).baseUrl || (client as any).getHomeserverUrl?.();
    if (!baseUrl) return;

    const url = `${baseUrl}/_matrix/client/v1/media/download/${encodeURIComponent(serverName)}/${encodeURIComponent(mediaId)}`;
    const file = fileHash ? fileRef.current : undefined;

    withFreshAccessToken(client, (accessToken) =>
      fetch(url, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        signal: controller.signal,
      }),
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return readBounded(res, controller.signal);
      })
      .then(async (blob) => {
        if (!file) {
          return blob.slice(0, blob.size, inlineSafeType(blob.type));
        }
        // The homeserver only knows the ciphertext's type. The sender's
        // mimetype is inside the encrypted event but is still the sender's
        // choice, so it passes the same allowlist.
        const plaintext = await decryptAttachment(
          await blob.arrayBuffer(),
          file,
        ).catch(() => {
          throw new MediaUnverifiedError();
        });
        return new Blob([plaintext], { type: inlineSafeType(mimetype) });
      })
      .then((blob) => {
        // The effect can re-run (new mxc/client) or unmount between the fetch
        // dispatch and resolve; its cleanup has then already run.
        if (revoked) return;
        created = URL.createObjectURL(blob);
        setBlobUrl(created);
      })
      .catch((error) => {
        // Do NOT fall back to the legacy unauthenticated /media/v3/download
        // endpoint: it would bypass the homeserver's authenticated media
        // gate and leak the mxc URL through the page's network log.
        if (!revoked) {
          setBlobUrl(
            error instanceof MediaUnverifiedError
              ? MEDIA_UNVERIFIED
              : MEDIA_UNAVAILABLE,
          );
        }
      });

    return () => {
      revoked = true;
      controller.abort();
      // Revoked here rather than in a state updater: an updater queued during
      // unmount never runs, which leaked every blob of an unmounted message.
      if (created) URL.revokeObjectURL(created);
      setBlobUrl(null);
    };
  }, [mxcUrl, fileHash, mimetype, fileInvalid, client]);

  return blobUrl;
}
