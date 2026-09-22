import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { RolePopover } from './RolePopover';

// The modal store and the icon package are mocked globally in test/setupTests;
// every icon renders as a <span> carrying its name as data-testid.

const cached = {
  uuid: 'role-1',
  name: 'CUSTOMER.OWNER',
  description: 'Organization owner',
  permissions: ['CALL.CREATE'],
};

describe('RolePopover', () => {
  beforeEach(() => {
    (ENV.roles as any[]).push(cached);
  });

  afterEach(() => {
    const index = (ENV.roles as any[]).indexOf(cached);
    if (index !== -1) (ENV.roles as any[]).splice(index, 1);
  });

  it('shows the description and an icon opening the details', () => {
    render(<RolePopover roleName="CUSTOMER.OWNER" />);
    expect(screen.queryByText('Organization owner')).not.toBeNull();
    expect(screen.queryByTestId('QuestionIcon')).not.toBeNull();
  });

  it('shows the bare name and no icon for a role the cache does not know', () => {
    // A deleted role, or one private to an organization the viewer cannot see.
    // There is nothing to open, and the dialog used to render an empty body
    // under a "Role details: undefined" title.
    render(<RolePopover roleName="CUSTOMER.GONE" />);
    expect(screen.queryByText('CUSTOMER.GONE')).not.toBeNull();
    expect(screen.queryByTestId('QuestionIcon')).toBeNull();
  });
});
