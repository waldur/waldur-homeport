import { describe, expect, it } from 'vitest';

import { states } from '@/states';

describe('managed project routes', () => {
  const byName = new Map(states.map((state) => [state.name, state]));

  // useTabs lists every child state with a breadcrumb unless it sets
  // skipBreadcrumb; a detail page opened without its params would be broken.
  it('keeps the managed project detail page out of the tabs', () => {
    const detail = byName.get('marketplace-provider-managed-project-detail');
    expect(detail?.url).toContain(':identifier');
    expect(detail?.data?.skipBreadcrumb).toBe(true);
  });

  it('still lists the managed project pages that need no params', () => {
    for (const name of [
      'marketplace-provider-managed-projects',
      'marketplace-provider-managed-projects-audit',
      'marketplace-provider-project-templates',
    ]) {
      expect(byName.get(name)?.data?.skipBreadcrumb, name).toBeFalsy();
    }
  });
});
