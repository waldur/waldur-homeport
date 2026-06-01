import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  rancherAppsCreate,
  rancherClustersRetrieve,
  rancherProjectsList,
  rancherTemplatesRetrieve,
  rancherTemplateVersionsRetrieve,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { TemplateDetail } from './TemplateDetail';

ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE = false;
ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE = 'Waldur';

const renderComponent = () => renderWithProviders(<TemplateDetail />);

describe('TemplateDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      params: { templateUuid: 't-1', clusterUuid: 'c-1' },
    } as any);
  });

  it('renders loading spinner while loading data', () => {
    vi.mocked(rancherTemplatesRetrieve).mockReturnValue(
      new Promise(() => {}) as any,
    );
    renderComponent();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders form after data is loaded', async () => {
    vi.mocked(rancherTemplatesRetrieve).mockResolvedValue({
      data: {
        uuid: 't-1',
        name: 'Test Template',
        default_version: '1.0',
        versions: ['1.0'],
      },
    } as any);
    vi.mocked(rancherClustersRetrieve).mockResolvedValue({
      data: {
        uuid: 'c-1',
        service_settings: 's-1',
        project: 'p-1',
      },
    } as any);
    vi.mocked(rancherTemplateVersionsRetrieve).mockResolvedValue({
      data: { questions: [], readme: 'Test Readme', app_readme: 'App Readme' },
    } as any);
    vi.mocked(rancherProjectsList).mockResolvedValue(
      mockListResponse([{ namespaces: [] }]),
    );

    renderComponent();
    await screen.findByText(/Configuration/);
  });

  it('submits form with correct data', async () => {
    vi.mocked(rancherTemplatesRetrieve).mockResolvedValue({
      data: {
        uuid: 't-1',
        name: 'Test Template',
        default_version: '1.0',
        versions: ['1.0'],
      },
    } as any);
    vi.mocked(rancherClustersRetrieve).mockResolvedValue({
      data: {
        uuid: 'c-1',
        service_settings: 's-1',
        project: 'p-1',
      },
    } as any);
    vi.mocked(rancherTemplateVersionsRetrieve).mockResolvedValue({
      data: {
        questions: [{ variable: 'q1', type: 'string', label: 'Q1' }],
        readme: 'R',
        app_readme: 'AR',
      },
    } as any);
    const project = {
      uuid: 'p-1',
      name: 'Project 1',
      url: 'u-1',
      namespaces: [{ name: 'ns-1', url: 'n-1' }],
    };
    vi.mocked(rancherProjectsList).mockResolvedValue(
      mockListResponse([project]),
    );
    vi.mocked(rancherAppsCreate).mockResolvedValue({
      data: { uuid: 'a-1' },
    } as any);

    renderComponent();
    await screen.findByText(/^Configuration$/);

    const user = userEvent.setup();
    // Fill Application name
    await user.type(screen.getByLabelText('Name *'), 'my-app');

    // Fill Q1 (dynamic question)
    await user.type(screen.getByLabelText('Q1'), 'ans-1');

    // Select project and namespace
    await user.selectOptions(screen.getByLabelText('Project *'), 'u-1');
    await user.selectOptions(screen.getByLabelText('Namespace *'), 'ns-1');

    const button = screen.getByRole('button', {
      name: /Create application/i,
    });
    await waitFor(() => expect(button).not.toBeDisabled());
    await user.click(button);

    await waitFor(() => {
      expect(rancherAppsCreate).toHaveBeenCalled();
    });

    const callArgs = vi.mocked(rancherAppsCreate).mock.calls[0][0];
    expect(callArgs.body.name).toBe('my-app');
    expect(callArgs.body.answers).toEqual({ q1: 'ans-1' });
  });

  it('renders error message if data loading fails', async () => {
    vi.mocked(rancherTemplatesRetrieve).mockRejectedValue(
      new Error('Load failed'),
    );
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText(/Unable to load application template details./),
      ).toBeInTheDocument();
    });
  });
});
