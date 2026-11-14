import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ManagedProjectExpandableRow } from './ManagedProjectExpandableRow';

const row = (projectTemplate): any => ({
  identifier: 'award-42',
  destination: 'portal.cluster',
  state: 'pending',
  project_template_data: projectTemplate,
  details: {
    name: 'Award project',
    members: {
      'pi@example.org': 'PI',
      'researcher@example.org': 'researcher',
      'guest@example.org': 'observer',
    },
  },
});

describe('ManagedProjectExpandableRow members', () => {
  it('shows the local role when role_mapping holds plain role names', () => {
    renderWithProviders(
      <ManagedProjectExpandableRow
        row={row({
          name: 'Template',
          role_mapping: { PI: 'PROJECT.MANAGER', Researcher: 'PROJECT.MEMBER' },
          role_mapping_data: {
            PI: { name: 'PROJECT.MANAGER', description: 'Project manager' },
            Researcher: { name: 'PROJECT.MEMBER', description: '' },
          },
        })}
      />,
    );

    expect(screen.getByText(/pi@example\.org/)).toHaveTextContent(
      'pi@example.org : Project manager',
    );
    // Matched case-insensitively; a role without a description shows its name.
    expect(screen.getByText(/researcher@example\.org/)).toHaveTextContent(
      'researcher@example.org : PROJECT.MEMBER',
    );
    expect(screen.getByText(/guest@example\.org/)).toHaveTextContent(
      'guest@example.org : observer has no mapping - will not be added to project',
    );
    expect(screen.queryByText(/Not set/)).not.toBeInTheDocument();
  });

  it('says members will not be added when the template maps no roles', () => {
    renderWithProviders(
      <ManagedProjectExpandableRow
        row={row({ name: 'Template', role_mapping: {}, role_mapping_data: {} })}
      />,
    );

    expect(screen.getByText(/pi@example\.org/)).toHaveTextContent(
      'pi@example.org : Will not be added to project',
    );
  });
});
