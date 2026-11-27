import { ProposalDocumentation } from 'waldur-js-client';

import { translate } from '@/i18n';

/**
 * An attached document as the duplicate check reads it. `file_hash` is the
 * SHA-256 of its content, as the backend compares it when refusing a copy.
 */
type AttachedDocument = Pick<ProposalDocumentation, 'file_name'> & {
  file_hash?: string | null;
};

/**
 * What counts as the same pending file without reading it: name, size and
 * modification time. Used to list a file once and to cancel the one the
 * applicant means.
 */
export const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

/** The name an attached document is shown with: storage adds a path and a
 * suffix to it. */
export const documentDisplayName = (fileName: string) =>
  fileName
    .split('/')
    .pop()
    .replace(/_[^_]+\./, '.');

const digests = new WeakMap<File, Promise<string | null>>();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');

/**
 * The SHA-256 of a file's content, once per file. Null where the browser
 * cannot hash -- outside a secure context there is no `crypto.subtle` --
 * and the backend's own check at upload is all there is.
 */
export const fileDigest = (file: File): Promise<string | null> => {
  let digest = digests.get(file);
  if (!digest) {
    const subtle = globalThis.crypto?.subtle;
    // A file that cannot be read is left to the backend's check.
    digest = subtle
      ? Promise.resolve()
          .then(() => file.arrayBuffer())
          .then((content) => subtle.digest('SHA-256', content))
          .then(toHex)
          .catch(() => null)
      : Promise.resolve(null);
    digests.set(file, digest);
  }
  return digest;
};

export interface ScreenedFiles {
  accepted: File[];
  /** Why each refused file was refused, one sentence each. */
  refused: string[];
}

/**
 * Splits newly chosen files into those to add and those already on the
 * proposal: attached or pending, by content, whatever the name. The backend
 * refuses a copy of an attached file anyway; saying so at once spares the
 * applicant a failed save. A replacement is meant to be made by removing the
 * attached file first.
 */
export const screenNewFiles = async (
  chosen: File[],
  pending: File[],
  attached: AttachedDocument[],
): Promise<ScreenedFiles> => {
  const known = new Map<string, { name: string; attached: boolean }>();
  attached.forEach((document) => {
    if (document.file_hash) {
      known.set(document.file_hash, {
        name: documentDisplayName(document.file_name),
        attached: true,
      });
    }
  });
  const listed = [...pending];
  for (const file of pending) {
    const digest = await fileDigest(file);
    if (digest && !known.has(digest)) {
      known.set(digest, { name: file.name, attached: false });
    }
  }
  const result: ScreenedFiles = { accepted: [], refused: [] };
  for (const file of chosen) {
    if (listed.some((other) => sameFile(other, file))) {
      result.refused.push(
        translate('{file} is already in the list.', { file: file.name }),
      );
      continue;
    }
    const digest = await fileDigest(file);
    const twin = digest ? known.get(digest) : undefined;
    if (twin) {
      result.refused.push(
        twin.attached
          ? translate(
              '{file} has the same content as {other}, which is already attached. To replace it, remove {other} first.',
              { file: file.name, other: twin.name },
            )
          : twin.name === file.name
            ? translate('{file} is already in the list.', { file: file.name })
            : translate(
                '{file} has the same content as {other}, which is already in the list.',
                { file: file.name, other: twin.name },
              ),
      );
      continue;
    }
    if (digest) known.set(digest, { name: file.name, attached: false });
    listed.push(file);
    result.accepted.push(file);
  }
  return result;
};

/**
 * The refused files of a save that are copies of a document the proposal
 * holds: of one attached before it, or of one this save attached. Nothing
 * more can come of them, so they leave the pending list.
 */
export const duplicatesOfAttached = async (
  refused: File[],
  uploaded: File[],
  attached: AttachedDocument[],
): Promise<File[]> => {
  const held = new Set(
    attached.map((document) => document.file_hash).filter(Boolean),
  );
  for (const file of uploaded) {
    const digest = await fileDigest(file);
    if (digest) held.add(digest);
  }
  const duplicates: File[] = [];
  for (const file of refused) {
    const digest = await fileDigest(file);
    if (digest && held.has(digest)) duplicates.push(file);
  }
  return duplicates;
};
