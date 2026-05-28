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

import { TemplateDetail } from './TemplateDetail';

ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE = false;
ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE = 'Waldur';

vi.mock('@/core/api', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    getAllPages: vi.fn((fn) => fn(1).then((r) => r.data)),
  };
});

vi.mock('@/navigation/title', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useTitle: vi.fn(),
  };
});

const renderComponent = () => renderWithProviders(<TemplateDetail />);

describe('TemplateDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCurrentStateAndParams as any).mockReturnValue({
      params: { templateUuid: 't-1', clusterUuid: 'c-1' },
    });
  });

  it('renders loading spinner while loading data', () => {
    (rancherTemplatesRetrieve as any).mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders form after data is loaded', async () => {
    (rancherTemplatesRetrieve as any).mockResolvedValue({
      data: {
        uuid: 't-1',
        name: 'Test Template',
        default_version: '1.0',
        versions: ['1.0'],
      },
    });
    (rancherClustersRetrieve as any).mockResolvedValue({
      data: {
        uuid: 'c-1',
        service_settings: 's-1',
        project: 'p-1',
      },
    });
    (rancherTemplateVersionsRetrieve as any).mockResolvedValue({
      data: { questions: [], readme: 'Test Readme', app_readme: 'App Readme' },
    });
    (rancherProjectsList as any).mockResolvedValue({
      data: [{ namespaces: [] }],
      headers: {},
    });

    renderComponent();
    await screen.findByText(/Configuration/);
  });

  it('submits form with correct data', async () => {
    (rancherTemplatesRetrieve as any).mockResolvedValue({
      data: {
        uuid: 't-1',
        name: 'Test Template',
        default_version: '1.0',
        versions: ['1.0'],
      },
    });
    (rancherClustersRetrieve as any).mockResolvedValue({
      data: {
        uuid: 'c-1',
        service_settings: 's-1',
        project: 'p-1',
      },
    });
    (rancherTemplateVersionsRetrieve as any).mockResolvedValue({
      data: {
        questions: [{ variable: 'q1', type: 'string', label: 'Q1' }],
        readme: 'R',
        app_readme: 'AR',
      },
    });
    const project = {
      uuid: 'p-1',
      name: 'Project 1',
      url: 'u-1',
      namespaces: [{ name: 'ns-1', url: 'n-1' }],
    };
    (rancherProjectsList as any).mockResolvedValue({
      data: [project],
      headers: {},
    });
    (rancherAppsCreate as any).mockResolvedValue({ data: { uuid: 'a-1' } });

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

    const callArgs = (rancherAppsCreate as any).mock.calls[0][0];
    expect(callArgs.body.name).toBe('my-app');
    expect(callArgs.body.answers).toEqual({ q1: 'ans-1' });
  });

  it('renders error message if data loading fails', async () => {
    (rancherTemplatesRetrieve as any).mockRejectedValue(
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
