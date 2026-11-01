import { render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useProject, useUser } from '@/workspace/hooks';

import { ProjectContainer } from './ProjectContainer';

// The real LayoutSlot renders into Layout's hero element, which isn't here.
vi.mock('@/navigation/slots', () => ({
  LayoutSlot: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/navigation/header/breadcrumb/utils', () => ({
  usePresetBreadcrumbItems: () => ({
    getOrganizationsBreadcrumbItem: () => ({ key: 'organizations' }),
    getOrganizationBreadcrumbItem: () => ({ key: 'organization' }),
    getOrganizationProjectsBreadcrumbItem: () => ({ key: 'projects' }),
  }),
}));

vi.mock('./ProjectBreadcrumbPopover', () => ({
  ProjectBreadcrumbPopover: () => null,
}));

vi.mock('./ProjectProfile', () => ({ ProjectProfile: () => null }));

const STAFF = { is_staff: true, permissions: [] };
const NO_ROLES = { is_staff: false, permissions: [] };

const renderOn = (stateName: string, user: object = STAFF) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: stateName },
    params: {},
  } as any);
  vi.mocked(useUser).mockReturnValue(user as any);
  vi.mocked(useProject).mockReturnValue({
    uuid: 'project-uuid',
    name: 'Project',
    customer_uuid: 'customer-uuid',
  } as any);
  render(<ProjectContainer />);
};

const projectViews = () =>
  screen.queryByRole('navigation', { name: 'Project views' });

describe('ProjectContainer View and Edit tabs', () => {
  // The first has a link in the bar; the others are reached from the page
  // tabs or from a link, and have to light View up all the same.
  it.each([
    'project.dashboard',
    'project.resources',
    'project.events',
    'project.issues',
    'project-users',
    'project-invitations',
    'marketplace-project-update-requests',
  ])('keeps View active on %s', (stateName) => {
    renderOn(stateName);
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Edit' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('moves the highlight to Edit on project-manage', () => {
    renderOn('project-manage');
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'View' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('shows the bar to a user who can edit the project', () => {
    renderOn('project.resources');
    expect(projectViews()).toBeInTheDocument();
  });

  it('shows no bar to a user who cannot edit the project', () => {
    renderOn('project.resources', NO_ROLES);
    expect(projectViews()).not.toBeInTheDocument();
  });
});
