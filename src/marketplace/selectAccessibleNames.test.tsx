import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { OrganizationAutocomplete } from './orders/OrganizationAutocomplete';
import { ProjectAutocomplete } from './resources/list/ProjectAutocomplete';

vi.mock('@/marketplace/common/autocompletes', () => ({
  organizationAutocomplete: () => () =>
    Promise.resolve({ options: [], hasMore: false }),
  projectAutocomplete: () => () =>
    Promise.resolve({ options: [], hasMore: false }),
}));

// The organization and project selects appear in the Add resource dialog and
// the resource filters with nothing but a placeholder, so without an
// aria-label they are two unnamed comboboxes: a screen reader cannot tell them
// apart and neither can a test that looks them up by role.
describe('organization and project selects', () => {
  it('are comboboxes named Organization and Project', () => {
    render(
      <Form onSubmit={vi.fn()}>
        {() => (
          <>
            <OrganizationAutocomplete />
            <ProjectAutocomplete />
          </>
        )}
      </Form>,
    );
    expect(
      screen.getByRole('combobox', { name: 'Organization' }),
    ).toHaveAttribute('id', 'organization-selector-input');
    expect(screen.getByRole('combobox', { name: 'Project' })).toHaveAttribute(
      'id',
      'project-selector-input',
    );
  });

  it('keep a name when the caller changes the placeholder', () => {
    render(
      <Form onSubmit={vi.fn()}>
        {() => <OrganizationAutocomplete placeholder="Pick one" />}
      </Form>,
    );
    expect(
      screen.getByRole('combobox', { name: 'Organization' }),
    ).toBeInTheDocument();
  });
});
