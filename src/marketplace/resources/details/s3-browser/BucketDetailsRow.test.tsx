import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { S3BucketDetails } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { BucketDetailsRow } from './BucketDetailsRow';
import { S3Source } from './s3Source';

const details = (
  overrides: Partial<S3BucketDetails> = {},
): S3BucketDetails => ({
  bucket: 'data',
  objects: 1,
  size_bytes: 10,
  location: 'zg',
  versioning: { status: 'Enabled', mfa_delete: false },
  object_lock: null,
  acl: {
    owner: 'owner',
    grants: [
      {
        type: 'Group',
        grantee: 'http://acs.amazonaws.com/groups/global/AllUsers',
        display_name: '',
        group: 'all_users',
        permission: 'READ',
      },
    ],
  },
  policy: null,
  policy_public: false,
  public_access_block: null,
  lifecycle_rules: null,
  encryption: null,
  cors_rules: null,
  tags: null,
  public_acl_groups: ['all_users'],
  is_public: true,
  unavailable: [],
  ...overrides,
});

const sourceWith = (data: S3BucketDetails) =>
  ({ bucketDetails: vi.fn().mockResolvedValue(data) }) as unknown as S3Source;

describe('BucketDetailsRow', () => {
  it('names a public ACL grant and flags the bucket public', async () => {
    renderWithProviders(
      <BucketDetailsRow
        source={sourceWith(details())}
        keyUuid="k"
        bucket="data"
      />,
    );

    expect(
      await screen.findByText('Public through the ACL'),
    ).toBeInTheDocument();
    expect(screen.getByText('Everyone (anonymous): READ')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('leaves out the parts the storage service would not report', async () => {
    renderWithProviders(
      <BucketDetailsRow
        source={sourceWith(
          details({
            is_public: false,
            public_acl_groups: [],
            unavailable: ['public_access_block'],
          }),
        )}
        keyUuid="k"
        bucket="data"
      />,
    );

    expect(await screen.findByText('Private')).toBeInTheDocument();
    expect(screen.queryByText('Public access block')).not.toBeInTheDocument();
  });

  it('shows only what the gateway flavor implements', async () => {
    renderWithProviders(
      <BucketDetailsRow
        source={sourceWith(details({ acl: null, versioning: null }))}
        keyUuid="k"
        bucket="data"
        capabilities={{
          flavor: 'garage',
          bucket_stats: false,
          bucket_parts: ['location', 'lifecycle_rules', 'cors_rules'],
          object_parts: [],
        }}
      />,
    );

    expect(await screen.findByText('zg')).toBeInTheDocument();
    expect(screen.getByText(/CORS rules/)).toBeInTheDocument();
    for (const hidden of [
      'Public access',
      'Access control list',
      'Versioning',
      'Object lock',
      'Bucket policy',
      'Tags',
    ]) {
      expect(screen.queryByText(hidden)).not.toBeInTheDocument();
    }
  });
});
