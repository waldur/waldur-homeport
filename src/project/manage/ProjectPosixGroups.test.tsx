import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProjectPosixGroupsList } from 'waldur-js-client';

import { useTable } from '@/table/useTable';
import { renderWithProviders } from '@/test/harness';

import { ProjectPosixGroups } from './ProjectPosixGroups';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn(() => true) }));

vi.mock('@/table/useTable', () => ({ useTable: vi.fn() }));

const tables: Record<string, any> = {};
vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tables[props.title] = props;
    return null;
  },
}));

const providerGroup = {
  kind: 'provider_project_group',
  gid: 20003,
  offering_uuid: null,
  offering_name: null,
  provider_name: 'HPC Centre',
  role: null,
  scope_type: null,
  scope_name: null,
  scope_uuid: null,
  group_uuid: 'group-uuid',
  group_name: 'my-project',
  service_provider_uuid: 'provider-uuid',
  in_use: true,
  offerings: [{ uuid: 'offering-uuid', name: 'Cluster A' }],
  members: ['alice', 'bob'],
  member_count: 2,
};

const roleGroup = {
  kind: 'role_group',
  gid: 30001,
  offering_uuid: 'offering-uuid',
  offering_name: 'Cluster A',
  provider_name: 'HPC Centre',
  role: 'PROJECT.MANAGER',
  scope_type: 'project',
  scope_name: 'My project',
  scope_uuid: 'project-uuid',
};

const renderCell = (table: string, title: string, row: any) => {
  const column = tables[table].columns.find((c) => c.title === title);
  return render(<>{column.render({ row })}</>);
};

describe('ProjectPosixGroups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(tables)) {
      delete tables[key];
    }
    vi.mocked(useTable).mockReturnValue({ rows: [], fetch: vi.fn() } as any);
    vi.mocked(marketplaceProjectPosixGroupsList).mockResolvedValue({
      data: [providerGroup, roleGroup],
    } as any);
  });

  it('splits the rollup into provider groups and per-offering groups', async () => {
    renderWithProviders(
      <ProjectPosixGroups project={{ uuid: 'project-uuid' } as any} />,
    );

    await waitFor(() => expect(useTable).toHaveBeenCalledTimes(2));
    const [providerOptions, offeringOptions] = vi
      .mocked(useTable)
      .mock.calls.slice(0, 2)
      .map(([options]) => options);
    await expect(providerOptions.fetchData({} as any)).resolves.toEqual({
      rows: [providerGroup],
      resultCount: 1,
    });
    await expect(offeringOptions.fetchData({} as any)).resolves.toEqual({
      rows: [roleGroup],
      resultCount: 1,
    });
    // One request serves both tables.
    expect(marketplaceProjectPosixGroupsList).toHaveBeenCalledTimes(1);
  });

  it('shows the provider, group name, GID, offerings and use', async () => {
    renderWithProviders(
      <ProjectPosixGroups project={{ uuid: 'project-uuid' } as any} />,
    );
    await waitFor(() =>
      expect(tables['Groups at service providers']).toBeDefined(),
    );
    const table = 'Groups at service providers';

    renderCell(table, 'Service provider', providerGroup);
    renderCell(table, 'Group name', providerGroup);
    renderCell(table, 'GID', providerGroup);
    renderCell(table, 'Offerings', providerGroup);
    renderCell(table, 'Status', providerGroup);
    expect(screen.getByText('HPC Centre')).toBeInTheDocument();
    expect(screen.getByText('my-project')).toBeInTheDocument();
    expect(screen.getByText('20003')).toBeInTheDocument();
    expect(screen.getByText('Cluster A')).toBeInTheDocument();
    expect(screen.getByText('In use')).toBeInTheDocument();
  });

  it('copes with a group that has no GID yet', async () => {
    renderWithProviders(
      <ProjectPosixGroups project={{ uuid: 'project-uuid' } as any} />,
    );
    await waitFor(() =>
      expect(tables['Groups at service providers']).toBeDefined(),
    );

    renderCell('Groups at service providers', 'GID', {
      ...providerGroup,
      gid: null,
    });
    expect(screen.getByText('Not assigned yet')).toBeInTheDocument();
  });

  it('says in a sentence which group and GID the project has where', async () => {
    renderWithProviders(
      <ProjectPosixGroups project={{ uuid: 'project-uuid' } as any} />,
    );

    expect(
      await screen.findByText(
        'Files and cluster access at HPC Centre use group my-project, GID 20003.',
      ),
    ).toBeInTheDocument();
    expect(tables['Groups at service providers'].expandableRow).toBeDefined();
    expect(tables['Groups at service providers'].columns[0].title).toBe(
      'Group name',
    );
    expect(tables['Groups at service providers'].hasActionBar).toBeUndefined();
  });

  it('shows an error with a retry when the groups cannot be loaded', async () => {
    vi.mocked(marketplaceProjectPosixGroupsList).mockRejectedValue({
      response: { status: 500 },
      status: 500,
    });
    const user = userEvent.setup();
    renderWithProviders(
      <ProjectPosixGroups project={{ uuid: 'project-uuid' } as any} />,
    );

    expect(
      await screen.findByTestId('posix-groups-error', {}, { timeout: 4000 }),
    ).toHaveTextContent('Unable to load the POSIX groups of this project.');

    vi.mocked(marketplaceProjectPosixGroupsList).mockResolvedValue({
      data: [providerGroup],
    } as any);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() =>
      expect(
        screen.queryByTestId('posix-groups-error'),
      ).not.toBeInTheDocument(),
    );
  });

  it('heads the per-offering list so it reads apart from the provider list', async () => {
    renderWithProviders(
      <ProjectPosixGroups project={{ uuid: 'project-uuid' } as any} />,
    );
    await waitFor(() => expect(tables['Groups per offering']).toBeDefined());

    const table = tables['Groups per offering'];
    // The heading only renders with the action bar, which must stay on.
    expect(table.hasActionBar).not.toBe(false);
    expect(table.hideTitle).toBeFalsy();
    await expect(
      vi.mocked(useTable).mock.calls[1][0].fetchData({} as any),
    ).resolves.toMatchObject({ rows: [roleGroup] });
  });

  it('counts zero members as 0, not as missing', async () => {
    renderWithProviders(
      <ProjectPosixGroups project={{ uuid: 'project-uuid' } as any} />,
    );
    await waitFor(() =>
      expect(tables['Groups at service providers']).toBeDefined(),
    );

    renderCell('Groups at service providers', 'Members', {
      ...providerGroup,
      members: [],
      member_count: 0,
    });
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
