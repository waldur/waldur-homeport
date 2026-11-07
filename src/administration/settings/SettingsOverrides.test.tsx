import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  overrideSettingsRetrieve,
  overrideSettingsSourcesList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { SettingsOverrides } from './SettingsOverrides';

const UPDATED_AT = '2026-10-20T10:00:00Z';

const row = (key: string, source: string, extra = {}) => ({
  key,
  source,
  source_detail: '',
  locked: false,
  managed_by: '',
  updated_at: UPDATED_AT,
  updated_by_username: null,
  ...extra,
});

const renderPage = (values: object, sources: object[]) => {
  vi.mocked(overrideSettingsRetrieve).mockResolvedValue({
    data: values,
  } as any);
  vi.mocked(overrideSettingsSourcesList).mockResolvedValue({
    data: sources,
  } as any);
  renderWithProviders(<SettingsOverrides />);
};

describe('SettingsOverrides', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
  });

  it('groups the overridden settings by who set them', async () => {
    renderPage(
      {
        SITE_NAME: 'Portal',
        BRAND_COLOR: '#FF0000',
        SITE_EMAIL: 'info@example.com',
      },
      [
        row('SITE_NAME', 'deployment', {
          source_detail: 'whitelabeling.yaml',
          locked: true,
          managed_by: 'whitelabeling.yaml',
        }),
        row('BRAND_COLOR', 'api', { updated_by_username: 'alice' }),
        row('SITE_EMAIL', 'migration', { source_detail: 'django-constance' }),
        // No longer described: not rendered.
        row('REMOVED_SETTING', 'api'),
      ],
    );

    expect(
      await screen.findByText('Managed by deployment'),
    ).toBeInTheDocument();
    expect(screen.getByText('Changed by administrators')).toBeInTheDocument();
    expect(
      screen.getByText('Carried over from django-constance'),
    ).toBeInTheDocument();
    expect(screen.getByText('Portal')).toBeInTheDocument();
    expect(screen.getByText(/alice ·/)).toBeInTheDocument();
    expect(screen.queryByText('Set by Waldur')).not.toBeInTheDocument();
    expect(screen.queryByText(/REMOVED_SETTING|Removed setting/)).toBeNull();
    expect(screen.getAllByText(/whitelabeling\.yaml/).length).toBeGreaterThan(
      0,
    );
    // The group heading says it; rows carry no badge repeating it.
    expect(
      screen.queryByText('Managed by deployment · whitelabeling.yaml'),
    ).toBeNull();
  });

  it('lists a setting a deploy re-applies once, apart from seeds', async () => {
    renderPage({ SITE_NAME: 'Portal', SITE_EMAIL: 'info@example.com' }, [
      // Changed by an administrator, but the next deploy writes it again.
      row('SITE_NAME', 'api', {
        updated_by_username: 'alice',
        managed_by: 'init_matrix_settings',
      }),
      row('SITE_EMAIL', 'deployment', { source_detail: 'languages.yaml' }),
    ]);

    expect(
      await screen.findByText('Re-applied by deployment'),
    ).toBeInTheDocument();
    expect(screen.getByText('Set by deployment')).toBeInTheDocument();
    expect(screen.queryByText('Changed by administrators')).toBeNull();
    expect(screen.getAllByText('Portal')).toHaveLength(1);
  });

  it('blocks what the Matrix tab blocks', async () => {
    renderPage(
      {
        MATRIX_TOKENS_MANAGED_BY: 'deployment',
        MATRIX_HOMESERVER_URL: 'https://matrix.example.com',
      },
      [
        row('MATRIX_HOMESERVER_URL', 'deployment', {
          source_detail: 'init_matrix_settings',
          managed_by: 'init_matrix_settings',
        }),
      ],
    );

    await screen.findByText('Re-applied by deployment');
    expect(screen.getByRole('button', { name: /Edit/ })).toBeDisabled();
  });

  it('leaves out a stored value that equals the default', async () => {
    renderPage({ SITE_NAME: 'Waldur' }, [
      row('SITE_NAME', 'api', { updated_by_username: 'alice' }),
    ]);

    expect(
      await screen.findByText('Every setting has its default value.'),
    ).toBeInTheDocument();
  });

  it('leaves out a dict that equals the default in another key order', async () => {
    renderPage(
      {
        DOCKER_IMAGES: {
          shell: { command: 'sh', image: 'alpine:3' },
          ansible: {
            command: 'ansible-playbook',
            image: 'alpine/ansible:2.18.6',
          },
          python: { command: 'python', image: 'python:3.12-alpine' },
        },
      },
      [row('DOCKER_IMAGES', 'api', { updated_by_username: 'alice' })],
    );

    expect(
      await screen.findByText('Every setting has its default value.'),
    ).toBeInTheDocument();
  });

  it('says so when every setting has its default', async () => {
    renderPage({}, []);

    expect(
      await screen.findByText('Every setting has its default value.'),
    ).toBeInTheDocument();
  });
});
