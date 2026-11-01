import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsChecklistRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProjectMetadata } from './ProjectMetadata';

const project = {
  uuid: 'project-uuid',
  customer_uuid: 'customer-uuid',
  is_removed: false,
} as any;

const userWith = (roleName: string) =>
  ({
    is_staff: false,
    is_support: false,
    permissions: [
      {
        scope_type: 'project',
        scope_uuid: project.uuid,
        role_name: roleName,
        customer_uuid: project.customer_uuid,
      },
    ],
  }) as any;

let savedRoles;

describe('ProjectMetadata edit controls', () => {
  beforeEach(() => {
    savedRoles = ENV.roles;
    ENV.roles = [
      {
        name: 'METADATA.EDITOR',
        permissions: [PermissionEnum.UPDATE_PROJECT_METADATA],
      },
      {
        name: 'PROJECT.EDITOR',
        permissions: [PermissionEnum.UPDATE_PROJECT],
      },
    ] as any;
    vi.mocked(projectsChecklistRetrieve).mockResolvedValue({
      data: {
        questions: [
          {
            uuid: 'question-uuid',
            description: 'Purpose',
            existing_answer: null,
          },
        ],
      },
    } as any);
  });

  afterEach(() => {
    ENV.roles = savedRoles;
  });

  it('lets a metadata editor answer the checklist and leaves project fields read-only', async () => {
    vi.mocked(useUser).mockReturnValue(userWith('METADATA.EDITOR'));
    renderWithProviders(<ProjectMetadata project={project} />);

    expect(
      await screen.findByTestId('edit-checklist-question-uuid'),
    ).toBeInTheDocument();
    const [fields, checklist] = screen.getAllByRole('table');
    expect(fields).toHaveClass('hide-actions');
    expect(checklist).not.toHaveClass('hide-actions');
  });

  it('lets a project editor change project fields and hides checklist answers they cannot update', async () => {
    vi.mocked(useUser).mockReturnValue(userWith('PROJECT.EDITOR'));
    renderWithProviders(<ProjectMetadata project={project} />);

    expect(await screen.findByText('Purpose')).toBeInTheDocument();
    expect(
      screen.queryByTestId('edit-checklist-question-uuid'),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('table')[0]).not.toHaveClass('hide-actions');
  });
});
