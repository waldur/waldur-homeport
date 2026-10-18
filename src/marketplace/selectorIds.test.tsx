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

// The integration suite finds these two selects by these exact ids
// (waldur-integration-testing: add_resource_dialog.py, marketplace/filter.py),
// so they are part of the page's contract and must not become generated ids.
describe('selector ids the integration suite depends on', () => {
  it('keeps #organization-selector-input', () => {
    render(
      <Form onSubmit={vi.fn()}>{() => <OrganizationAutocomplete />}</Form>,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'id',
      'organization-selector-input',
    );
  });

  it('keeps #project-selector-input', () => {
    render(<Form onSubmit={vi.fn()}>{() => <ProjectAutocomplete />}</Form>);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'id',
      'project-selector-input',
    );
  });
});
