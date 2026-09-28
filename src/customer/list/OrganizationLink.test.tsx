import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/workspace/hooks';

import { OrganizationLink } from './OrganizationLink';

describe('OrganizationLink', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: true,
      is_support: false,
      permissions: [],
    } as any);
  });

  it('forwards buttonSize to the link', () => {
    render(
      <OrganizationLink uuid="c1" buttonVariant="text-primary" buttonSize="sm">
        Details
      </OrganizationLink>,
    );

    expect(screen.getByText('Details')).toHaveClass('py-[4px]');
  });

  it('is md when no size is given', () => {
    render(
      <OrganizationLink uuid="c1" buttonVariant="text-primary">
        Details
      </OrganizationLink>,
    );

    expect(screen.getByText('Details')).toHaveClass('py-[8px]');
  });

  // Without permission there is no link to render, but asButton keeps the
  // control on the page as a disabled button that must match its siblings.
  it('keeps the size on the disabled fallback button', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      is_support: false,
      permissions: [],
    } as any);
    render(
      <OrganizationLink
        uuid="c1"
        asButton
        buttonVariant="text-primary"
        buttonSize="sm"
      >
        Details
      </OrganizationLink>,
    );

    const button = screen.getByRole('button', { name: 'Details' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('py-[4px]');
  });
});
