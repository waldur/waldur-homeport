import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { S3BrowserCapabilities } from 'waldur-js-client';

import {
  Badge,
  FormText,
  NoResult,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { grantee, partShown } from './BucketDetailsRow';
import { S3Source } from './s3Source';

/**
 * One file as the resource's key reads it, loaded when the row opens:
 * content headers, user metadata, storage class, encryption, object lock,
 * ACL, tags and how many versions the bucket keeps of it. Read-only. Only
 * what the gateway implements and answered is shown.
 */
export const ObjectDetailsRow: FC<{
  source: S3Source;
  keyUuid: string;
  bucket: string;
  objectKey: string;
  capabilities?: S3BrowserCapabilities;
}> = ({ source, keyUuid, bucket, objectKey, capabilities }) => {
  const query = useQuery({
    queryKey: ['s3-object-details', keyUuid, bucket, objectKey],
    queryFn: () => source.objectDetails(bucket, objectKey),
  });
  if (query.isLoading) {
    return (
      <ExpandableContainer>
        <FormText>{translate('Reading the file details…')}</FormText>
      </ExpandableContainer>
    );
  }
  if (query.isError || !query.data) {
    return (
      <ExpandableContainer>
        <NoResult
          title={translate('Unable to read the file details')}
          buttonTitle={translate('Try again')}
          callback={() => query.refetch()}
        />
      </ExpandableContainer>
    );
  }
  const details = query.data;
  const shown = partShown(capabilities?.object_parts, details.unavailable);
  // Encryption and locks are headers of the object, but only gateways that
  // configure them on the bucket ever set them.
  const bucketHas = partShown(capabilities?.bucket_parts, []);
  const versions = [
    details.versions_truncated
      ? translate('{n}+', { n: details.versions })
      : String(details.versions),
    details.delete_markers
      ? translate('{n} delete markers', { n: details.delete_markers })
      : null,
  ]
    .filter(Boolean)
    .join(', ');
  const lock = details.lock_mode
    ? [
        details.lock_mode,
        details.retain_until &&
          translate('until {date}', {
            date: formatDateTime(details.retain_until),
          }),
      ]
        .filter(Boolean)
        .join(', ')
    : translate('None');

  return (
    <ExpandableContainer>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
        <PropertyList variant="summary" termWidth="md" hideIfEmpty={false}>
          <PropertyItem
            label={translate('Content type')}
            value={details.content_type}
          />
          <PropertyItem
            label={translate('Size')}
            value={propVal.fileSize(details.size)}
          />
          <PropertyItem
            label={translate('Last modified')}
            value={propVal.date(details.modified)}
          />
          <PropertyItem
            label={translate('ETag')}
            value={propVal.code(details.etag)}
          />
          <PropertyItem
            label={translate('Uploaded in parts')}
            value={
              details.multipart_parts
                ? translate('{n} parts', { n: details.multipart_parts })
                : translate('No')
            }
          />
          <PropertyItem
            label={translate('Storage class')}
            value={details.storage_class}
          />
          {details.content_encoding && (
            <PropertyItem
              label={translate('Content encoding')}
              value={details.content_encoding}
            />
          )}
          {details.content_disposition && (
            <PropertyItem
              label={translate('Content disposition')}
              value={details.content_disposition}
            />
          )}
          {details.cache_control && (
            <PropertyItem
              label={translate('Cache control')}
              value={details.cache_control}
            />
          )}
          <PropertyItem
            label={translate('User metadata')}
            value={
              details.metadata.length
                ? propVal.list(
                    details.metadata.map(
                      (entry) => `${entry.key}: ${entry.value}`,
                    ),
                    { display: 'stack' },
                  )
                : translate('None')
            }
          />
        </PropertyList>
        <PropertyList variant="summary" termWidth="md" hideIfEmpty={false}>
          {shown('acl') && (
            <>
              <PropertyItem
                label={translate('Public access')}
                value={
                  details.is_public ? (
                    <Badge variant="danger">
                      {translate('Public through the ACL')}
                    </Badge>
                  ) : (
                    <Badge variant="success">{translate('Private')}</Badge>
                  )
                }
              />
              <PropertyItem
                label={translate('Owner')}
                value={details.acl?.owner}
              />
              <PropertyItem
                label={translate('Access control list')}
                value={propVal.list(
                  (details.acl?.grants ?? []).map(
                    (grant) => `${grantee(grant)}: ${grant.permission}`,
                  ),
                  { display: 'stack' },
                )}
              />
            </>
          )}
          {bucketHas('encryption') && (
            <PropertyItem
              label={translate('Encryption')}
              value={details.encryption || translate('None')}
            />
          )}
          {bucketHas('object_lock') && (
            <>
              <PropertyItem label={translate('Object lock')} value={lock} />
              <PropertyItem
                label={translate('Legal hold')}
                value={propVal.boolean(details.legal_hold)}
              />
            </>
          )}
          {shown('versions') && (
            <PropertyItem label={translate('Versions')} value={versions} />
          )}
          {details.version_id && (
            <PropertyItem
              label={translate('Current version')}
              value={propVal.code(details.version_id)}
            />
          )}
          {shown('tags') && (
            <PropertyItem
              label={translate('Tags')}
              value={
                details.tags?.length
                  ? propVal.list(details.tags.map((t) => `${t.key}=${t.value}`))
                  : translate('None')
              }
            />
          )}
        </PropertyList>
      </div>
    </ExpandableContainer>
  );
};
