import { lazyComponent } from '@/core/lazyComponent';

import { registerTabPagesPreload } from './tabPreload';

// The pages behind the My tasks tabs, defined once: the routes mount them, and
// the tabs preload the rest so switching tab never blinks through a spinner.
export const MyTasksPageLazy = lazyComponent(() =>
  import('./MyTasksPage').then((module) => ({ default: module.MyTasksPage })),
);
export const MyReviewsPageLazy = lazyComponent(() =>
  import('./MyReviewsPage').then((module) => ({
    default: module.MyReviewsPage,
  })),
);
export const MyAssignmentsPageLazy = lazyComponent(() =>
  import('./MyAssignmentsPage').then((module) => ({
    default: module.MyAssignmentsPage,
  })),
);
export const MyInvitationsPageLazy = lazyComponent(() =>
  import('./MyInvitationsPage').then((module) => ({
    default: module.MyInvitationsPage,
  })),
);
export const MyEvaluatorRolesPageLazy = lazyComponent(() =>
  import('./MyEvaluatorRolesPage').then((module) => ({
    default: module.MyEvaluatorRolesPage,
  })),
);
export const MyCallsPageLazy = lazyComponent(() =>
  import('./MyCallsPage').then((module) => ({ default: module.MyCallsPage })),
);

const preloadMyTasksPages = () =>
  Promise.all(
    [
      MyTasksPageLazy,
      MyReviewsPageLazy,
      MyAssignmentsPageLazy,
      MyInvitationsPageLazy,
      MyEvaluatorRolesPageLazy,
      MyCallsPageLazy,
    ].map((page) => page.preload()),
  );

registerTabPagesPreload(preloadMyTasksPages);
