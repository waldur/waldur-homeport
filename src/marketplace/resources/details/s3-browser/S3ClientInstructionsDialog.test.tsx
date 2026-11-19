import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { S3ClientInstructionsDialog } from './S3ClientInstructionsDialog';

const info = {
  endpoint: 'https://s3.example.org',
  region: 'default',
  access_key: 'AKIAEXAMPLE000000001',
  max_upload_size: 50 * 1024 * 1024,
  quotas: { scope: 'account' as const, total: null, per_bucket: null },
  capabilities: {
    flavor: 'ceph' as const,
    bucket_stats: true,
    bucket_parts: [],
    object_parts: [],
  },
};

describe('S3ClientInstructionsDialog', () => {
  it('fills the AWS CLI commands with the endpoint, region, folder and access key', () => {
    renderWithProviders(
      <S3ClientInstructionsDialog
        resolve={{ info, bucket: 'data', prefix: 'logs/' }}
      />,
    );

    const snippet = screen.getByText(/AWS_ACCESS_KEY_ID=/).textContent;
    expect(snippet).toContain('AWS_ACCESS_KEY_ID=AKIAEXAMPLE000000001');
    expect(snippet).toContain('--endpoint-url https://s3.example.org');
    expect(snippet).toContain('AWS_DEFAULT_REGION=default');
    expect(snippet).toContain('s3://data/logs/');
  });

  it('uploads the contents of a folder with s3cmd, not the folder itself', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <S3ClientInstructionsDialog
        resolve={{ info, bucket: 'data', prefix: 'logs/' }}
      />,
    );

    await user.click(screen.getByRole('radio', { name: 's3cmd' }));

    const snippet = screen.getByText(/host_base/).textContent;
    expect(snippet).toContain(
      's3cmd put --recursive ./my-folder/ s3://data/logs/',
    );
    expect(snippet).toContain('s3cmd put ./my-file s3://data/logs/');
  });

  it('does not point to the API keys tab when the offering hides it', () => {
    renderWithProviders(
      <S3ClientInstructionsDialog resolve={{ info, keysTabHidden: true }} />,
    );

    expect(screen.queryByText(/Reveal on the API keys tab/)).toBeNull();
    expect(screen.getByText(/<secret key>/)).toBeInTheDocument();
  });

  it('never carries a secret, only where to reveal it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<S3ClientInstructionsDialog resolve={{ info }} />);

    for (const client of ['AWS CLI', 'rclone', 's3cmd']) {
      await user.click(screen.getByRole('radio', { name: client }));
      expect(
        screen.getByText(/Reveal on the API keys tab>/),
      ).toBeInTheDocument();
    }
  });

  it('configures rclone for path-style addressing', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <S3ClientInstructionsDialog resolve={{ info, bucket: 'data' }} />,
    );

    await user.click(screen.getByRole('radio', { name: 'rclone' }));

    const snippet = screen.getByText(/force_path_style/).textContent;
    expect(snippet).toContain('force_path_style = true');
    expect(snippet).toContain('waldur:data/');
  });
});
