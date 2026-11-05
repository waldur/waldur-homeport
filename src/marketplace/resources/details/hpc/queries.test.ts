import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hpcWorkspacesList } from 'waldur-js-client';

import {
  getHpcWorkspaceMode,
  hasFirecrest,
  notifyHpcJobSubmitted,
  subscribeHpcJobSubmitted,
} from './queries';

const FIRECREST = {
  firecrest_api_url: 'https://firecrest.example.org',
  firecrest_system_name: 'cluster-a',
};
const MONITOR = {
  slurm_monitor_api_url: 'https://monitor.example.org/api/v2',
  slurm_monitor_cluster_name: 'cluster-a',
};

const workspaces = (...items: object[]) =>
  vi.mocked(hpcWorkspacesList).mockResolvedValue({ data: items } as any);

describe('hasFirecrest', () => {
  it('reads the workspace flag', () => {
    expect(hasFirecrest({ firecrest_enabled: true })).toBe(true);
    expect(hasFirecrest({ firecrest_enabled: false })).toBe(false);
  });

  it('takes a backend without the flag for FirecREST, its only kind', () => {
    expect(hasFirecrest({})).toBe(true);
  });

  it('knows nothing before the workspace has loaded', () => {
    expect(hasFirecrest(undefined)).toBe(false);
  });
});

describe('getHpcWorkspaceMode', () => {
  beforeEach(() => vi.mocked(hpcWorkspacesList).mockReset());

  it('is no workspace for an offering naming neither endpoint', async () => {
    expect(await getHpcWorkspaceMode('r-1', {})).toBeNull();
    expect(hpcWorkspacesList).not.toHaveBeenCalled();
  });

  it('is a read-only workspace for a cluster monitor only', async () => {
    workspaces({
      resource_uuid: 'r-1',
      firecrest_enabled: false,
      monitoring_enabled: true,
    });
    expect(await getHpcWorkspaceMode('r-1', MONITOR)).toEqual({
      firecrest: false,
      monitoring: true,
    });
  });

  it('is a FirecREST workspace when the backend says so', async () => {
    workspaces({
      resource_uuid: 'r-1',
      firecrest_enabled: true,
      monitoring_enabled: false,
    });
    expect(await getHpcWorkspaceMode('r-1', FIRECREST)).toEqual({
      firecrest: true,
      monitoring: false,
    });
  });

  it('asks for the resource only', async () => {
    workspaces();
    await getHpcWorkspaceMode('r-1', FIRECREST);
    expect(hpcWorkspacesList).toHaveBeenCalledWith({
      query: { resource_uuid: 'r-1', page_size: 200 },
    });
  });

  it('is none when the backend does not serve it, e.g. an endpoint staff have not allowed', async () => {
    workspaces({ resource_uuid: 'other', firecrest_enabled: true });
    expect(await getHpcWorkspaceMode('r-1', FIRECREST)).toBeNull();
  });
});

describe('subscribeHpcJobSubmitted', () => {
  it('hears jobs of its own allocation, with or without dashes', () => {
    const onSubmitted = vi.fn();
    const unsubscribe = subscribeHpcJobSubmitted(
      '4928ba35-fdc0-415b-8d74-4458a5a1c4ad',
      onSubmitted,
    );
    notifyHpcJobSubmitted('4928ba35fdc0415b8d744458a5a1c4ad');
    notifyHpcJobSubmitted('another-allocation');
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    unsubscribe();
    notifyHpcJobSubmitted('4928ba35fdc0415b8d744458a5a1c4ad');
    expect(onSubmitted).toHaveBeenCalledTimes(1);
  });
});
