import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoleEnum } from '@/permissions/enums';
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

  describe('where it leads', () => {
    const linkTo = (permissions) => {
      cleanup();
      vi.mocked(useUser).mockReturnValue({
        is_staff: false,
        is_support: false,
        permissions,
      } as any);
      render(<OrganizationLink uuid="c1">Org</OrganizationLink>);
      return screen.queryByRole('link', { name: 'Org' })?.getAttribute('href');
    };
    const call = (role_name) => ({
      scope_type: 'call',
      scope_uuid: 'call-1',
      customer_uuid: 'c1',
      role_name,
    });

    it('sends a reviewer or panel member of a call to the organization', () => {
      expect(linkTo([call(RoleEnum.CALL_PANEL_MEMBER)])).toContain(
        'organization.dashboard',
      );
      expect(linkTo([call(RoleEnum.CALL_REVIEWER)])).toContain(
        'organization.dashboard',
      );
    });

    it('sends a call manager to the call management', () => {
      expect(linkTo([call(RoleEnum.CALL_MANAGER)])).toContain(
        'call-management.dashboard',
      );
    });

    it('has no link through an offering role alone', () => {
      expect(
        linkTo([
          {
            scope_type: 'offering',
            scope_uuid: 'o1',
            customer_uuid: 'c1',
            role_name: RoleEnum.OFFERING_MANAGER,
          },
        ]),
      ).toBeUndefined();
    });

    it('keeps a project role on the project list', () => {
      expect(
        linkTo([
          {
            scope_type: 'project',
            scope_uuid: 'pr1',
            customer_uuid: 'c1',
            role_name: RoleEnum.PROJECT_MEMBER,
          },
        ]),
      ).toContain('marketplace-projects');
    });

    it('has no link without a role in the organization', () => {
      expect(
        linkTo([
          {
            scope_type: 'call',
            scope_uuid: 'call-2',
            customer_uuid: 'c2',
            role_name: RoleEnum.CALL_MANAGER,
          },
        ]),
      ).toBeUndefined();
    });
  });
});
