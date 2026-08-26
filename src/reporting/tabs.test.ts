import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { isStateVisible } from '@/core/stateVisibility';
import { router } from '@/router';

import { states } from './routes';
import { getReportingTabs } from './tabs';

const stateByName = Object.fromEntries(
  states.map((state) => [state.name, state]),
);

const staffWorkspace = { user: { is_staff: true, permissions: [] } };

const setFeatures = (features) => {
  (ENV as any).FEATURES = features;
};

beforeEach(() => {
  // Resolve reporting state names against the real route table, so the tabs
  // are checked against the gate the router actually enforces.
  vi.mocked(router.stateRegistry.get).mockImplementation(
    (name) => stateByName[name as string],
  );
  setFeatures({});
});

describe('getReportingTabs', () => {
  // The regression: `proposals` is a category of call management, but its
  // route is gated on experimental UI. Reading only the category flag put a
  // tab on screen whose target answers with the feature-disabled page.
  it('hides the proposals tab when call management is on but experimental UI is off', () => {
    setFeatures({
      marketplace: {
        show_call_management_functionality: true,
        show_experimental_ui_components: false,
      },
    });
    const tabs = getReportingTabs(staffWorkspace);
    expect(tabs.map((tab) => tab.state)).not.toContain(
      'reporting-proposals-list',
    );
  });

  it('shows the proposals tab when both flags are on', () => {
    setFeatures({
      marketplace: {
        show_call_management_functionality: true,
        show_experimental_ui_components: true,
      },
    });
    const tabs = getReportingTabs(staffWorkspace);
    expect(tabs.map((tab) => tab.state)).toContain('reporting-proposals-list');
  });

  it.each([
    ['everything off', {}],
    [
      'call management only',
      { marketplace: { show_call_management_functionality: true } },
    ],
    [
      'experimental UI only',
      { marketplace: { show_experimental_ui_components: true } },
    ],
    [
      'everything on',
      {
        marketplace: {
          show_call_management_functionality: true,
          show_experimental_ui_components: true,
        },
        support: { pricelist: true, vm_type_overview: true },
      },
    ],
  ])('offers no tab the router would reject — %s', (_label, features) => {
    setFeatures(features);
    getReportingTabs(staffWorkspace).forEach((tab) => {
      expect(
        stateByName[tab.state],
        `${tab.state} is not a state`,
      ).toBeTruthy();
      expect(isStateVisible(tab.state), `${tab.state} is gated off`).toBe(true);
    });
  });

  it('always offers the overview', () => {
    expect(getReportingTabs(staffWorkspace)[0].state).toBe(
      'reporting-dashboard',
    );
  });
});
