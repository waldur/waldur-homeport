import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProjectPosixGroupsList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProjectPosixGroupsWidget } from './ProjectPosixGroupsWidget';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn(() => true) }));

vi.mock('@/core/Link', () => ({
  Link: ({ label, params }) => (
    <a href={`#${params.tab}`} data-testid="details-link">
      {label}
    </a>
  ),
}));

const providerGroup = {
  kind: 'provider_project_group',
  gid: 20003,
  provider_name: 'HPC Centre',
  group_uuid: 'group-uuid',
  group_name: 'my-project',
};

const project = {
  uuid: 'project-uuid',
  customer_uuid: 'customer-uuid',
} as any;

const manager = {
  is_staff: false,
  permissions: [
    {
      scope_type: 'project',
      scope_uuid: project.uuid,
      role_name: RoleEnum.PROJECT_MANAGER,
      customer_uuid: project.customer_uuid,
    },
  ],
};

let savedRoles;

const mockGroups = (groups: object[]) =>
  vi.mocked(marketplaceProjectPosixGroupsList).mockResolvedValue({
    data: groups,
  } as any);

describe('ProjectPosixGroupsWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isFeatureVisible).mockReturnValue(true);
    savedRoles = ENV.roles;
    ENV.roles = [
      {
        name: RoleEnum.PROJECT_MANAGER,
        permissions: [PermissionEnum.UPDATE_PROJECT],
      },
    ] as any;
    vi.mocked(useUser).mockReturnValue(manager as any);
  });

  afterEach(() => {
    ENV.roles = savedRoles;
  });

  it('shows the project’s provider groups on the overview with a link to the details', async () => {
    vi.mocked(marketplaceProjectPosixGroupsList).mockResolvedValue({
      data: [providerGroup],
    } as any);
    renderWithProviders(<ProjectPosixGroupsWidget project={project} />);

    expect(
      await screen.findByText(
        'Files and cluster access at HPC Centre use group my-project, GID 20003.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('details-link')).toHaveAttribute(
      'href',
      '#posix-identities',
    );
  });

  it('hides the details link from someone who cannot edit the project', async () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      permissions: [],
    } as any);
    vi.mocked(marketplaceProjectPosixGroupsList).mockResolvedValue({
      data: [providerGroup],
    } as any);
    renderWithProviders(<ProjectPosixGroupsWidget project={project} />);

    expect(
      await screen.findByText(
        'Files and cluster access at HPC Centre use group my-project, GID 20003.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('details-link')).not.toBeInTheDocument();
  });

  it('links to details for someone who can open settings without editing the project', async () => {
    ENV.roles = [
      {
        name: 'ORDER.APPROVER',
        permissions: [PermissionEnum.APPROVE_ORDER],
      },
    ] as any;
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      is_support: false,
      permissions: [
        {
          scope_type: 'project',
          scope_uuid: project.uuid,
          role_name: 'ORDER.APPROVER',
          customer_uuid: project.customer_uuid,
        },
      ],
    } as any);
    vi.mocked(marketplaceProjectPosixGroupsList).mockResolvedValue({
      data: [providerGroup],
    } as any);
    renderWithProviders(<ProjectPosixGroupsWidget project={project} />);

    expect(await screen.findByTestId('details-link')).toHaveAttribute(
      'href',
      '#posix-identities',
    );
  });

  it('stays hidden without provider groups', async () => {
    vi.mocked(marketplaceProjectPosixGroupsList).mockResolvedValue({
      data: [{ kind: 'role_group', gid: 30001 }],
    } as any);
    const { container } = renderWithProviders(
      <ProjectPosixGroupsWidget project={project} />,
    );

    await vi.waitFor(() =>
      expect(marketplaceProjectPosixGroupsList).toHaveBeenCalled(),
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('says when the groups cannot be loaded and offers to retry', async () => {
    vi.mocked(marketplaceProjectPosixGroupsList).mockRejectedValue({
      response: { status: 500 },
      status: 500,
    });
    const user = userEvent.setup();
    renderWithProviders(<ProjectPosixGroupsWidget project={project} />);

    expect(
      await screen.findByTestId('posix-groups-error', {}, { timeout: 4000 }),
    ).toBeInTheDocument();

    vi.mocked(marketplaceProjectPosixGroupsList).mockResolvedValue({
      data: [providerGroup],
    } as any);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() =>
      expect(
        screen.getByText(
          'Files and cluster access at HPC Centre use group my-project, GID 20003.',
        ),
      ).toBeInTheDocument(),
    );
  });

  it('stays hidden where POSIX pools are off, even with groups, without asking', async () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    mockGroups([providerGroup]);
    const { container } = renderWithProviders(
      <ProjectPosixGroupsWidget project={{ uuid: 'project-off' } as any} />,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(marketplaceProjectPosixGroupsList).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });
});
