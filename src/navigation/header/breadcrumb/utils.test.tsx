import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';

import { usePresetBreadcrumbItems } from './utils';

vi.mock('@/features/connect');
vi.mock('@/navigation/sidebar/resources-filter/utils', () => ({
  useOrganizationAndProjectAutocompletesForResources: () => ({
    syncResourceFilters: vi.fn(),
    removeFilter: vi.fn(),
  }),
}));

const mockStore = configureStore();

const renderPreset = (user: any) => {
  const store = mockStore({ workspace: { user } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => usePresetBreadcrumbItems(), { wrapper });
};

const projectOnlyUser = {
  is_staff: false,
  is_support: false,
  permissions: [{ scope_type: 'project' }],
};

const ownerUser = {
  is_staff: false,
  is_support: false,
  permissions: [{ scope_type: 'customer' }],
};

describe('usePresetBreadcrumbItems', () => {
  beforeEach(() => {
    vi.mocked(isFeatureVisible).mockReset();
  });

  describe('when the user can access the organization (feature off)', () => {
    beforeEach(() => {
      vi.mocked(isFeatureVisible).mockReturnValue(false);
    });

    it('builds the Organizations (top-level list) breadcrumb as a link', () => {
      const { result } = renderPreset(projectOnlyUser);
      const item = result.current.getOrganizationsBreadcrumbItem();

      expect(item).toMatchObject({
        key: 'organizations',
        text: 'Organizations',
        to: 'organizations',
      });
    });

    it('builds the organization breadcrumb as a link', () => {
      const { result } = renderPreset(projectOnlyUser);
      const item = result.current.getOrganizationBreadcrumbItem({
        uuid: 'cust-1',
        name: 'Acme',
      });

      expect(item).toMatchObject({
        key: 'organization.dashboard',
        text: 'Acme',
        to: 'organization.dashboard',
        params: { uuid: 'cust-1' },
      });
      expect(item.onClick).toEqual(expect.any(Function));
    });

    it('builds the Projects breadcrumb as a link', () => {
      const { result } = renderPreset(projectOnlyUser);
      const item =
        result.current.getOrganizationProjectsBreadcrumbItem('cust-1');

      expect(item).toMatchObject({
        key: 'organization.projects',
        to: 'organization.projects',
        params: { uuid: 'cust-1' },
      });
    });
  });

  describe('when the user cannot access the organization (feature on, project-only role)', () => {
    beforeEach(() => {
      vi.mocked(isFeatureVisible).mockReturnValue(true);
    });

    it('renders the Organizations (top-level list) breadcrumb as plain text (no link)', () => {
      const { result } = renderPreset(projectOnlyUser);
      const item = result.current.getOrganizationsBreadcrumbItem();

      expect(item.text).toBe('Organizations');
      expect(item.to).toBeUndefined();
    });

    it('renders the organization breadcrumb as plain text (no link, no onClick)', () => {
      const { result } = renderPreset(projectOnlyUser);
      const item = result.current.getOrganizationBreadcrumbItem({
        uuid: 'cust-1',
        name: 'Acme',
      });

      expect(item.text).toBe('Acme');
      expect(item.to).toBeUndefined();
      expect(item.params).toBeUndefined();
      expect(item.onClick).toBeUndefined();
    });

    it('renders the Projects breadcrumb as plain text (no link)', () => {
      const { result } = renderPreset(projectOnlyUser);
      const item =
        result.current.getOrganizationProjectsBreadcrumbItem('cust-1');

      expect(item.text).toBe('Projects');
      expect(item.to).toBeUndefined();
      expect(item.params).toBeUndefined();
    });

    it('still renders both breadcrumbs as links for an organization owner', () => {
      const { result } = renderPreset(ownerUser);

      const orgItem = result.current.getOrganizationBreadcrumbItem({
        uuid: 'cust-1',
        name: 'Acme',
      });
      const projectsItem =
        result.current.getOrganizationProjectsBreadcrumbItem('cust-1');

      expect(orgItem.to).toBe('organization.dashboard');
      expect(projectsItem.to).toBe('organization.projects');
    });
  });

  it('allows callers to override fields via the options argument', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    const { result } = renderPreset(projectOnlyUser);

    const orgItem = result.current.getOrganizationBreadcrumbItem(
      { uuid: 'cust-1', name: 'Acme' },
      { ellipsis: 'md' },
    );
    const projectsItem = result.current.getOrganizationProjectsBreadcrumbItem(
      'cust-1',
      { ellipsis: 'xxl' },
    );

    expect(orgItem.ellipsis).toBe('md');
    expect(projectsItem.ellipsis).toBe('xxl');
  });
});
