import { describe, expect, it, vi } from 'vitest';

import { getTabs } from './useTabs';

vi.mock('@/store/store', () => ({ default: { getState: () => ({}) } }));
vi.mock('@/features/connect', () => ({
  isFeatureVisible: (feature) => feature !== 'disabled',
}));

const allow = () => true;
const deny = () => false;

const root = { name: 'organization' };

const group = (permissions = [allow]) => ({
  name: 'organization-billing',
  parent: 'organization',
  redirectTo: 'organization-billing.billing',
  data: { breadcrumb: () => 'Accounting', permissions },
});

const invoices = (permissions) => ({
  name: 'organization-billing.billing',
  data: { breadcrumb: () => 'Invoices', permissions },
});

const credits = (permissions) => ({
  name: 'project-credit-management',
  parent: 'organization-billing',
  data: { breadcrumb: () => 'Credit management', permissions },
});

const titles = (tabs) => tabs.map((tab) => tab.title);

describe('getTabs', () => {
  it('lists only the children the user may open', () => {
    const tabs = getTabs(root, [group(), invoices([deny]), credits([allow])]);
    expect(titles(tabs)).toEqual(['Accounting']);
    expect(titles(tabs[0].children)).toEqual(['Credit management']);
  });

  it('drops a group whose children are all hidden and whose landing page is closed', () => {
    const tabs = getTabs(root, [group(), invoices([deny]), credits([deny])]);
    expect(tabs).toEqual([]);
  });

  it('drops such a group when its landing page is switched off by a feature', () => {
    const landing = { ...invoices([allow]) };
    landing.data = { ...landing.data, feature: 'disabled' } as any;
    expect(getTabs(root, [group(), landing])).toEqual([]);
  });

  it('keeps a childless group whose landing page is open but not listed', () => {
    const landing = {
      ...invoices([allow]),
      data: { ...invoices([allow]).data, skipBreadcrumb: true },
    };
    const tabs = getTabs(root, [group(), landing]);
    expect(titles(tabs)).toEqual(['Accounting']);
    expect(tabs[0].children).toEqual([]);
  });

  it('follows a landing page given as a state with params', () => {
    const withParams = (permissions) => [
      {
        ...group(),
        redirectTo: {
          state: 'organization-billing.billing',
          params: { tab: 'invoices' },
        },
      },
      {
        ...invoices(permissions),
        data: { ...invoices(permissions).data, skipBreadcrumb: true },
      },
    ];
    expect(titles(getTabs(root, withParams([allow])))).toEqual(['Accounting']);
    expect(getTabs(root, withParams([deny]))).toEqual([]);
  });

  it('keeps a childless tab that has no landing page of its own', () => {
    const plain = {
      name: 'organization-dashboard',
      parent: 'organization',
      data: { breadcrumb: () => 'Dashboard' },
    };
    expect(titles(getTabs(root, [plain]))).toEqual(['Dashboard']);
  });

  it('hides the group itself when its own guard fails', () => {
    expect(getTabs(root, [group([deny]), invoices([allow])])).toEqual([]);
  });
});
