import { describe, expect, it } from 'vitest';

import { getResourceTabs } from './fetchData';

const tabKeys = (resource: any, offering: any) =>
  getResourceTabs({
    resource: { uuid: 'res-1', ...resource },
    offering: { uuid: 'off-1', ...offering },
    scope: null,
    lexisLinksCount: 0,
    robotAccountsCount: 0,
    isStaff: false,
  }).map((tab) => tab.key);

describe('getResourceTabs: API keys', () => {
  it('shows the tab for a resource that reports keys', () => {
    expect(tabKeys({ has_api_keys: true }, {})).toContain('api-keys');
  });

  it('leaves it out for a resource without keys', () => {
    expect(tabKeys({ has_api_keys: false }, {})).not.toContain('api-keys');
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
