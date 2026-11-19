import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { S3ObjectDetails } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ObjectDetailsRow } from './ObjectDetailsRow';
import { S3Source } from './s3Source';

const details = (
  overrides: Partial<S3ObjectDetails> = {},
): S3ObjectDetails => ({
  bucket: 'data',
  key: 'logs/a.csv',
  size: 42,
  modified: '2026-11-18T10:00:00Z',
  etag: 'abc-3',
  multipart_parts: 3,
  content_type: 'text/csv',
  content_encoding: '',
  content_disposition: '',
  cache_control: '',
  storage_class: 'STANDARD',
  version_id: '',
  encryption: '',
  metadata: [{ key: 'source', value: 'lab' }],
  lock_mode: '',
  retain_until: null,
  legal_hold: false,
  acl: { owner: 'owner', grants: [] },
  is_public: false,
  tags: [],
  versions: 2,
  delete_markers: 1,
  versions_truncated: false,
  unavailable: [],
  ...overrides,
});

const sourceWith = (data: S3ObjectDetails) =>
  ({ objectDetails: vi.fn().mockResolvedValue(data) }) as unknown as S3Source;

describe('ObjectDetailsRow', () => {
  it('shows the content type, parts, metadata and versions', async () => {
    renderWithProviders(
      <ObjectDetailsRow
        source={sourceWith(details())}
        keyUuid="k"
        bucket="data"
        objectKey="logs/a.csv"
      />,
    );

    expect(await screen.findByText('text/csv')).toBeInTheDocument();
    expect(screen.getByText('3 parts')).toBeInTheDocument();
    expect(screen.getByText('source: lab')).toBeInTheDocument();
    expect(screen.getByText('2, 1 delete markers')).toBeInTheDocument();
  });

  it('leaves out the parts the storage service would not report', async () => {
    renderWithProviders(
      <ObjectDetailsRow
        source={sourceWith(
          details({ acl: null, is_public: null, unavailable: ['acl'] }),
        )}
        keyUuid="k"
        bucket="data"
        objectKey="logs/a.csv"
      />,
    );

    expect(await screen.findByText('text/csv')).toBeInTheDocument();
    expect(screen.queryByText('Access control list')).not.toBeInTheDocument();
    expect(screen.queryByText('Public access')).not.toBeInTheDocument();
  });

  it('leaves out locks, encryption and versions the flavor lacks', async () => {
    renderWithProviders(
      <ObjectDetailsRow
        source={sourceWith(details())}
        keyUuid="k"
        bucket="data"
        objectKey="logs/a.csv"
        capabilities={{
          flavor: 'garage',
          bucket_stats: false,
          bucket_parts: ['location', 'lifecycle_rules', 'cors_rules'],
          object_parts: [],
        }}
      />,
    );

    expect(await screen.findByText('text/csv')).toBeInTheDocument();
    for (const hidden of [
      'Object lock',
      'Legal hold',
      'Encryption',
      'Versions',
      'Tags',
      'Access control list',
    ]) {
      expect(screen.queryByText(hidden)).not.toBeInTheDocument();
    }
  });
});
