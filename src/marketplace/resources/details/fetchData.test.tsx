import { describe, expect, it } from 'vitest';

import { getResourceTabs } from './fetchData';

const tabKeys = (resource: any, offering: any, metricsCount = 0) =>
  getResourceTabs({
    resource: { uuid: 'res-1', ...resource },
    offering: { uuid: 'off-1', ...offering },
    scope: null,
    lexisLinksCount: 0,
    robotAccountsCount: 0,
    metricsCount,
    isStaff: false,
  }).map((tab) => tab.key);

describe('getResourceTabs: API keys', () => {
  it('shows the tab for a resource that reports keys', () => {
    expect(tabKeys({ has_api_keys: true }, {})).toContain('api-keys');
  });

  it('leaves it out for a resource without keys', () => {
    expect(tabKeys({ has_api_keys: false }, {})).not.toContain('api-keys');
  });

  it('shows it for a resource without keys when the offering manages them', () => {
    // A new resource there starts with none; the tab is where one is requested.
    expect(
      tabKeys(
        { has_api_keys: false },
        { plugin_options: { enable_api_key_provisioning: true } },
      ),
    ).toContain('api-keys');
  });

  it('leaves it out when the offering hides it', () => {
    expect(
      tabKeys(
        { has_api_keys: true },
        { plugin_options: { hide_api_keys_tab: true } },
      ),
    ).not.toContain('api-keys');
  });
});

describe('getResourceTabs: metrics', () => {
  it("shows the tab when the resource's offering reports metrics", () => {
    expect(tabKeys({}, {}, 2)).toContain('metrics');
  });

  it('leaves it out otherwise', () => {
    expect(tabKeys({}, {}, 0)).not.toContain('metrics');
  });
});
