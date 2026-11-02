import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProjectGeneral } from './ProjectGeneral';

const project = {
  uuid: 'project-uuid',
  name: 'Project',
  customer_uuid: 'customer-uuid',
  is_removed: false,
} as any;

const support = { is_staff: false, is_support: true, permissions: [] } as any;

const editor = {
  is_staff: false,
  is_support: false,
  permissions: [
    {
      scope_type: 'project',
      scope_uuid: project.uuid,
      role_name: 'PROJECT.EDITOR',
      customer_uuid: project.customer_uuid,
    },
  ],
} as any;

let savedRoles;

describe('ProjectGeneral edit controls', () => {
  beforeEach(() => {
    savedRoles = ENV.roles;
    ENV.roles = [
      { name: 'PROJECT.EDITOR', permissions: [PermissionEnum.UPDATE_PROJECT] },
    ] as any;
  });

  afterEach(() => {
    ENV.roles = savedRoles;
  });

  it('leaves the fields and the avatar editable for a project editor', () => {
    vi.mocked(useUser).mockReturnValue(editor);
    renderWithProviders(<ProjectGeneral project={project} />);
    expect(screen.getByTestId('property-list')).not.toHaveAttribute(
      'data-hide-actions',
    );
    expect(screen.getByText('Avatar')).toBeInTheDocument();
  });

  it('shows support the fields read-only, without the avatar upload', () => {
    vi.mocked(useUser).mockReturnValue(support);
    renderWithProviders(<ProjectGeneral project={project} />);
    expect(screen.getByTestId('property-list')).toHaveAttribute(
      'data-hide-actions',
      'true',
    );
    expect(screen.queryByText('Avatar')).not.toBeInTheDocument();
  });
});
