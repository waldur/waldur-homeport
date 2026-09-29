import { UIView } from '@uirouter/react';

import { StateDeclaration } from '@/core/types';

export const states: StateDeclaration[] = [
  // Now the Checklists tab of the Compliance page; kept as a redirect so
  // bookmarks and the chaos route sweep keep resolving. The staff gate moved
  // onto the tab.
  {
    name: 'admin-organization-checklist-management',
    url: 'organization-checklist-management/',
    parent: 'admin-organizations-compliance',
    // Never rendered: the redirect fires first. `component` is required by the
    // local StateDeclaration type.
    component: UIView,
    redirectTo: { state: 'admin-compliance', params: { tab: 'checklists' } },
    data: {
      skipBreadcrumb: true,
    },
  },
];
