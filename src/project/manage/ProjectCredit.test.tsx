import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { projectCreditsList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProjectCredit } from './ProjectCredit';

const project = {
  uuid: 'project-uuid',
  customer_uuid: 'customer-uuid',
  is_removed: false,
} as any;

const support = { is_staff: false, is_support: true, permissions: [] } as any;

const manager = {
  is_staff: false,
  is_support: false,
  permissions: [
    {
      scope_type: 'project',
      scope_uuid: project.uuid,
      role_name: 'PROJECT.MANAGER',
      customer_uuid: project.customer_uuid,
    },
  ],
} as any;

const owner = {
  is_staff: false,
  is_support: false,
  permissions: [
    {
      scope_type: 'customer',
      scope_uuid: project.customer_uuid,
      role_name: 'CUSTOMER.OWNER',
      customer_uuid: project.customer_uuid,
    },
  ],
} as any;

let savedRoles;

describe('ProjectCredit edit controls', () => {
  beforeEach(() => {
    savedRoles = ENV.roles;
    ENV.roles = [
      { name: 'CUSTOMER.OWNER', permissions: [PermissionEnum.UPDATE_PROJECT] },
      { name: 'PROJECT.MANAGER', permissions: [PermissionEnum.UPDATE_PROJECT] },
    ] as any;
    vi.mocked(projectCreditsList).mockResolvedValue({
      data: [{ uuid: 'credit-uuid', value: '100.00' }],
    } as any);
  });

  afterEach(() => {
    ENV.roles = savedRoles;
  });

  it('keeps the actions for an owner', async () => {
    vi.mocked(useUser).mockReturnValue(owner);
    renderWithProviders(<ProjectCredit project={project} />);
    const table = (await screen.findAllByRole('table'))[0];
    expect(table).not.toHaveClass('hide-actions');
  });

  it('keeps the actions for staff', async () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: true,
      is_support: false,
      permissions: [],
    } as any);
    renderWithProviders(<ProjectCredit project={project} />);
    const table = (await screen.findAllByRole('table'))[0];
    expect(table).not.toHaveClass('hide-actions');
  });

  it('offers no edits when the API returns no credit to edit', async () => {
    vi.mocked(projectCreditsList).mockResolvedValue({ data: [] } as any);
    vi.mocked(useUser).mockReturnValue(owner);
    renderWithProviders(<ProjectCredit project={project} />);
    const table = (await screen.findAllByRole('table'))[0];
    expect(table).toHaveClass('hide-actions');
  });

  // Credit writes need an owner: PROJECT.UPDATE alone gets a 403 from the API.
  it('shows a project manager the credit read-only', async () => {
    vi.mocked(useUser).mockReturnValue(manager);
    renderWithProviders(<ProjectCredit project={project} />);
    const table = (await screen.findAllByRole('table'))[0];
    expect(table).toHaveClass('hide-actions');
  });

  it('shows support the credit read-only', async () => {
    vi.mocked(useUser).mockReturnValue(support);
    renderWithProviders(<ProjectCredit project={project} />);
    const table = (await screen.findAllByRole('table'))[0];
    expect(table).toHaveClass('hide-actions');
  });
});
