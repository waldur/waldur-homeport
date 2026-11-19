import {
  marketplaceResourceApiKeysS3BucketDetailsRetrieve,
  marketplaceResourceApiKeysS3BucketsList,
  marketplaceResourceApiKeysS3CreateBucket,
  marketplaceResourceApiKeysS3DeleteBucket,
  marketplaceResourceApiKeysS3DeleteObjects,
  marketplaceResourceApiKeysS3DownloadUrl,
  marketplaceResourceApiKeysS3InfoRetrieve,
  marketplaceResourceApiKeysS3ObjectDetailsRetrieve,
  marketplaceResourceApiKeysS3ObjectsRetrieve,
  marketplaceResourceApiKeysS3Upload,
  S3BrowserInfo,
  S3Bucket,
  S3BucketDetails,
  ResourceApiKeyStatus,
  S3DeleteObjectsResult,
  S3ObjectDetails,
  S3ObjectList,
} from 'waldur-js-client';

import { translate } from '@/i18n';

/**
 * Everything the Buckets tab does, through one resource API key. Mastermind
 * signs each S3 call with the key's stored secret, so the browser never holds
 * it and no bucket needs CORS. Shaped as the S3 adapter of the planned shared
 * FileBrowser (a root per bucket, prefixes as folders, a cursor per page), so
 * the tab can move onto that component without touching the calls.
 */
export const s3Source = (keyUuid: string) => {
  const path = { uuid: keyUuid };
  return {
    info: (): Promise<S3BrowserInfo> =>
      marketplaceResourceApiKeysS3InfoRetrieve({ path }).then((r) => r.data),

    buckets: (): Promise<S3Bucket[]> =>
      marketplaceResourceApiKeysS3BucketsList({ path }).then((r) => r.data),

    /** ACL, policy, versioning, lock, lifecycle, encryption, CORS and tags. */
    bucketDetails: (bucket: string): Promise<S3BucketDetails> =>
      marketplaceResourceApiKeysS3BucketDetailsRetrieve({
        path,
        query: { bucket },
      }).then((r) => r.data),

    /** Headers, user metadata, lock, ACL, tags and version count of one file. */
    objectDetails: (bucket: string, key: string): Promise<S3ObjectDetails> =>
      marketplaceResourceApiKeysS3ObjectDetailsRetrieve({
        path,
        query: { bucket, key },
      }).then((r) => r.data),

    list: (
      bucket: string,
      prefix: string,
      cursor?: string,
    ): Promise<S3ObjectList> =>
      marketplaceResourceApiKeysS3ObjectsRetrieve({
        path,
        query: {
          bucket,
          prefix,
          continuation_token: cursor || undefined,
          page_size: 200,
        },
      }).then((r) => r.data),

    /** A five-minute presigned link; the browser downloads from the gateway. */
    download: async (bucket: string, key: string) => {
      const { data } = await marketplaceResourceApiKeysS3DownloadUrl({
        path,
        body: { bucket, key },
      });
      const link = document.createElement('a');
      link.href = data.url;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
    },

    createBucket: (bucket: string) =>
      marketplaceResourceApiKeysS3CreateBucket({ path, body: { bucket } }),

    deleteBucket: (bucket: string) =>
      marketplaceResourceApiKeysS3DeleteBucket({ path, body: { bucket } }),

    deleteObjects: (bucket: string, keys: string[]) =>
      marketplaceResourceApiKeysS3DeleteObjects({
        path,
        body: { bucket, keys },
      }).then((r) => r.data),

    /** Everything under a prefix; repeats while the server reports more. */
    deleteFolder: async (
      bucket: string,
      prefix: string,
    ): Promise<S3DeleteObjectsResult> => {
      let deleted = 0;
      // Each round lists the prefix afresh, so a key the gateway refused comes
      // back every round: count each refused key once.
      const errors = new Map<string, S3DeleteObjectsResult['errors'][number]>();
      for (;;) {
        const { data } = await marketplaceResourceApiKeysS3DeleteObjects({
          path,
          body: { bucket, prefix },
        });
        deleted += data.deleted;
        data.errors.forEach((error, index) =>
          errors.set(error.key ?? `#${index}`, error),
        );
        if (!data.remaining || data.deleted === 0) {
          return {
            deleted,
            errors: [...errors.values()],
            remaining: data.remaining,
          };
        }
      }
    },

    /** Refused with 409 ObjectExists when the key exists, unless overwrite. */
    upload: (bucket: string, key: string, file: File, overwrite = false) =>
      marketplaceResourceApiKeysS3Upload({
        path,
        body: { bucket, key, file, overwrite },
      }),
  };
};

export type S3Source = ReturnType<typeof s3Source>;

/** "logs/2026/" -> ["logs", "2026"]; the breadcrumb under a bucket. */
export const prefixParts = (prefix: string) =>
  prefix.split('/').filter(Boolean);

/** The last segment of a key or folder prefix, for display. */
export const baseName = (keyOrPrefix: string) => {
  const parts = prefixParts(keyOrPrefix);
  return parts[parts.length - 1] ?? keyOrPrefix;
};

/** The gateway answers a delete with 200 even when it refused some keys, such
 * as files under object lock; those come back as errors in the body. */
export const refusedDeletes = (result: S3DeleteObjectsResult) => {
  if (result.errors.length) {
    const first = result.errors[0];
    throw new Error(
      translate('{n} could not be deleted: {reason}', {
        n: result.errors.length,
        reason: first.detail || first.code || '',
      }),
    );
  }
  if (result.remaining) {
    throw new Error(
      translate('{n} deleted, but some files are left; try again.', {
        n: result.deleted,
      }),
    );
  }
  return result;
};

/** A key assigned to someone else is theirs alone to use (the server refuses
 * anyone else); offer only shared keys and the user's own. */
export const usableKeys = (keys: ResourceApiKeyStatus[], userUuid?: string) =>
  keys.filter((key) => !key.user_uuid || key.user_uuid === userUuid);

/** The error's JSON body, however the SDK raised it: the body itself, or an
 * axios-style wrapper with it in response.data. */
export const errorBody = (error: any) => error?.response?.data ?? error;
