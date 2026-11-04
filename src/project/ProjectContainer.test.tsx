import { render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { BreadcrumbsProvider, useBreadcrumbItems } from 'waldur-ui';

import { useCustomer, useProject, useUser } from '@/workspace/hooks';

import { ProjectContainer } from './ProjectContainer';

// The real LayoutSlot renders into Layout's hero element, which isn't here.
vi.mock('@/navigation/slots', () => ({
  LayoutSlot: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/navigation/header/breadcrumb/utils', () => ({
  usePresetBreadcrumbItems: () => ({
    getOrganizationsBreadcrumbItem: (options = {}) => ({
      key: 'organizations',
      text: 'Organizations',
      to: 'organizations',
      ...options,
    }),
    getOrganizationBreadcrumbItem: (customer, options = {}) => ({
      key: 'organization',
      text: customer.name,
      to: 'organization.dashboard',
      params: { uuid: customer.uuid },
      onClick: () => undefined,
      ...options,
    }),
    getOrganizationProjectsBreadcrumbItem: (uuid, options = {}) => ({
      key: 'projects',
      text: 'Projects',
      to: 'organization.projects',
      params: { uuid },
      ...options,
    }),
  }),
}));

vi.mock('./ProjectBreadcrumbPopover', () => ({
  ProjectBreadcrumbPopover: () => null,
}));

vi.mock('./ProjectProfile', () => ({ ProjectProfile: () => null }));

const STAFF = { is_staff: true, permissions: [] };
const NO_ROLES = { is_staff: false, permissions: [] };

const PROJECT = {
  uuid: 'project-uuid',
  name: 'Project',
  customer_uuid: 'customer-uuid',
  customer_name: 'Acme',
};

const renderOn = (stateName: string, user: object = STAFF) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: stateName },
    params: {},
  } as any);
  vi.mocked(useUser).mockReturnValue(user as any);
  vi.mocked(useCustomer).mockReturnValue({ uuid: 'customer-uuid' } as any);
  vi.mocked(useProject).mockReturnValue(PROJECT as any);
  render(<ProjectContainer />);
};

const CrumbProbe = () => {
  const items = useBreadcrumbItems();
  return (
    <ul>
      {items.map((item) => (
        <li key={item.key}>
          {item.key}:{item.text}:{item.to ?? 'text'}
          {item.onClick ? ':click' : ''}
          {item.params ? ':params' : ''}
        </li>
      ))}
    </ul>
  );
};

const renderTrail = (customer: object | null) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: 'project.dashboard' },
    params: {},
  } as any);
  vi.mocked(useUser).mockReturnValue(NO_ROLES as any);
  vi.mocked(useCustomer).mockReturnValue(customer as any);
  vi.mocked(useProject).mockReturnValue(PROJECT as any);
  render(
    <BreadcrumbsProvider>
      <ProjectContainer />
      <CrumbProbe />
    </BreadcrumbsProvider>,
  );
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

describe('ProjectContainer organization crumbs', () => {
  it('links the organization when it was loaded', async () => {
    renderTrail({ uuid: 'customer-uuid', name: 'Acme' });

    expect(
      await screen.findByText('organizations:Organizations:organizations'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('organization:Acme:organization.dashboard:click:params'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('projects:Projects:organization.projects:params'),
    ).toBeInTheDocument();
  });

  it('keeps the organization as text when it was not loaded', async () => {
    renderTrail(null);

    expect(
      await screen.findByText('organizations:Organizations:text'),
    ).toBeInTheDocument();
    expect(screen.getByText('organization:Acme:text')).toBeInTheDocument();
    expect(screen.getByText('projects:Projects:text')).toBeInTheDocument();
    expect(screen.getByText('project:Project:text')).toBeInTheDocument();
  });
});
