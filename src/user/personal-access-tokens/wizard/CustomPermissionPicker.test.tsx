import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { CustomPermissionPicker } from './CustomPermissionPicker';

const groups = [
  {
    label: 'Global',
    options: [
      { value: 'STAFF.ACCESS', label: 'Staff access' },
      { value: 'SUPPORT.ACCESS', label: 'Support access' },
    ],
  },
  {
    label: 'Projects',
    options: [{ value: 'PROJECT.LIST', label: 'List projects' }],
  },
];

const renderPicker = (hasBindings: boolean) =>
  render(
    <Form
      onSubmit={() => undefined}
      initialValues={{ scopes: [] }}
      render={() => (
        <CustomPermissionPicker
          input={{
            name: 'scopes',
            value: [],
            onChange: () => undefined,
            onBlur: () => undefined,
            onFocus: () => undefined,
          }}
          meta={{}}
          groups={groups}
          hasBindings={hasBindings}
        />
      )}
    />,
  );

describe('CustomPermissionPicker', () => {
  // The backend refuses global access together with entity restrictions.
  it('blocks staff and support access while the token has restrictions', () => {
    renderPicker(true);
    expect(screen.getByLabelText(/Staff access/)).toBeDisabled();
    expect(screen.getByLabelText(/Support access/)).toBeDisabled();
    expect(screen.getByLabelText(/List projects/)).toBeEnabled();
  });

  it('offers them on an unrestricted token', () => {
    renderPicker(false);
    expect(screen.getByLabelText(/Staff access/)).toBeEnabled();
  });
});
