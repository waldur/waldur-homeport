import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProjectPosixGroupsList } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { renderWithProviders } from '@/test/harness';

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

const project = { uuid: 'project-uuid' } as any;

const mockGroups = (groups: object[]) =>
  vi.mocked(marketplaceProjectPosixGroupsList).mockResolvedValue({
    data: groups,
  } as any);

describe('ProjectPosixGroupsWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isFeatureVisible).mockReturnValue(true);
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
