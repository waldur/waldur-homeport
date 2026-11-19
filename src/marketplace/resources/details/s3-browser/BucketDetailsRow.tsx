import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  S3BrowserCapabilities,
  S3BucketDetails,
  S3Grant,
} from 'waldur-js-client';

import {
  Badge,
  FormText,
  NoResult,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { S3Source } from './s3Source';

/** Whether a part of a details answer is worth a row: the gateway's flavor
 * implements it, and the gateway answered for it. */
export const partShown =
  (parts: string[] | undefined, unavailable: string[]) => (part: string) =>
    (!parts || parts.includes(part)) && !unavailable.includes(part);

export const grantee = (grant: S3Grant) => {
  if (grant.group === 'all_users') return translate('Everyone (anonymous)');
  if (grant.group === 'authenticated_users')
    return translate('Any authenticated user');
  return grant.display_name || grant.grantee || grant.type;
};

const objectLockText = (lock: S3BucketDetails['object_lock']) => {
  if (!lock?.enabled) return translate('Off');
  const period = lock.years
    ? translate('{n} years', { n: lock.years })
    : lock.days
      ? translate('{n} days', { n: lock.days })
      : null;
  return [translate('On'), lock.mode, period].filter(Boolean).join(', ');
};

const publicAccessBlockText = (
  block: S3BucketDetails['public_access_block'],
) => {
  if (!block) return translate('Not set');
  const on = [
    block.block_public_acls && translate('blocks public ACLs'),
    block.ignore_public_acls && translate('ignores public ACLs'),
    block.block_public_policy && translate('blocks public policies'),
    block.restrict_public_buckets && translate('restricts public buckets'),
  ].filter(Boolean);
  return on.length ? on.join(', ') : translate('Set, nothing blocked');
};

const lifecycleText = (rule: S3BucketDetails['lifecycle_rules'][number]) => {
  const scope = rule.prefix
    ? translate('under {prefix}', { prefix: rule.prefix })
    : translate('whole bucket');
  const actions = [
    rule.expiration_days &&
      translate('expire after {n} days', { n: rule.expiration_days }),
    rule.noncurrent_expiration_days &&
      translate('expire old versions after {n} days', {
        n: rule.noncurrent_expiration_days,
      }),
    rule.abort_multipart_days &&
      translate('abort unfinished uploads after {n} days', {
        n: rule.abort_multipart_days,
      }),
    rule.transitions > 0 &&
      translate('{n} storage class transitions', { n: rule.transitions }),
  ].filter(Boolean);
  return `${rule.id || translate('Unnamed rule')} (${scope}${
    rule.enabled ? '' : `, ${translate('disabled')}`
  }): ${actions.join(', ') || translate('no actions')}`;
};

const policyJson = (policy: string | null) => {
  if (!policy) return null;
  try {
    return JSON.parse(policy);
  } catch {
    return policy;
  }
};

/**
 * A bucket's configuration as the resource's key reads it, loaded when the
 * row opens. Read-only: changes go through an S3 client. Only what the
 * gateway implements and answered is shown.
 */
export const BucketDetailsRow: FC<{
  source: S3Source;
  keyUuid: string;
  bucket: string;
  capabilities?: S3BrowserCapabilities;
}> = ({ source, keyUuid, bucket, capabilities }) => {
  const query = useQuery({
    queryKey: ['s3-bucket-details', keyUuid, bucket],
    queryFn: () => source.bucketDetails(bucket),
  });
  if (query.isLoading) {
    return (
      <ExpandableContainer>
        <FormText>{translate('Reading the bucket configuration…')}</FormText>
      </ExpandableContainer>
    );
  }
  if (query.isError || !query.data) {
    return (
      <ExpandableContainer>
        <NoResult
          title={translate('Unable to read the bucket configuration')}
          buttonTitle={translate('Try again')}
          callback={() => query.refetch()}
        />
      </ExpandableContainer>
    );
  }
  const details = query.data;
  const shown = partShown(capabilities?.bucket_parts, details.unavailable);
  const knowsAccess = shown('acl') || shown('policy_public');

  return (
    <ExpandableContainer>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
        <PropertyList variant="summary" termWidth="md" hideIfEmpty={false}>
          {knowsAccess && (
            <PropertyItem
              label={translate('Public access')}
              value={
                details.is_public ? (
                  <Badge variant="danger">
                    {details.public_acl_groups.length
                      ? translate('Public through the ACL')
                      : translate('Public through the policy')}
                  </Badge>
                ) : (
                  <Badge variant="success">{translate('Private')}</Badge>
                )
              }
            />
          )}
          {shown('acl') && (
            <>
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
          {shown('public_access_block') && (
            <PropertyItem
              label={translate('Public access block')}
              value={publicAccessBlockText(details.public_access_block)}
            />
          )}
          {shown('policy') && (
            <PropertyItem
              label={translate('Bucket policy')}
              value={
                details.policy
                  ? propVal.json(policyJson(details.policy))
                  : translate('None')
              }
            />
          )}
          {shown('location') && (
            <PropertyItem
              label={translate('Location')}
              value={details.location}
            />
          )}
        </PropertyList>
        <PropertyList variant="summary" termWidth="md" hideIfEmpty={false}>
          {shown('versioning') && (
            <PropertyItem
              label={translate('Versioning')}
              value={details.versioning?.status}
            />
          )}
          {shown('object_lock') && (
            <PropertyItem
              label={translate('Object lock')}
              value={objectLockText(details.object_lock)}
            />
          )}
          {shown('encryption') && (
            <PropertyItem
              label={translate('Default encryption')}
              value={details.encryption || translate('None')}
            />
          )}
          {shown('lifecycle_rules') && (
            <PropertyItem
              label={translate('Lifecycle rules')}
              value={
                details.lifecycle_rules?.length
                  ? propVal.list(details.lifecycle_rules.map(lifecycleText), {
                      display: 'stack',
                    })
                  : translate('None')
              }
            />
          )}
          {shown('cors_rules') && (
            <PropertyItem
              label={translate('CORS rules')}
              value={
                details.cors_rules?.length
                  ? propVal.list(
                      details.cors_rules.map(
                        (rule) =>
                          `${rule.allowed_methods.join(', ')} ← ${rule.allowed_origins.join(', ')}`,
                      ),
                      { display: 'stack' },
                    )
                  : translate('None')
              }
            />
          )}
          {shown('tags') && (
            <PropertyItem
              label={translate('Tags')}
              value={
                details.tags?.length
                  ? propVal.list(
                      details.tags.map((tag) => `${tag.key}=${tag.value}`),
                    )
                  : translate('None')
              }
            />
          )}
        </PropertyList>
      </div>
    </ExpandableContainer>
  );
};
