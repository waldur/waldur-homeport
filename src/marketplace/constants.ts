import { WorkspaceType } from '@waldur/workspace/types';

export const WORKSPACE_OFFERING_DETAILS = {
  [WorkspaceType.ORGANIZATION]: 'marketplace-offering-customer',
  [WorkspaceType.PROJECT]: 'marketplace-offering-project',
  [WorkspaceType.USER]: 'marketplace-offering-user',
};

export const WORKSPACE_CATEGORY = {
  [WorkspaceType.ORGANIZATION]: 'marketplace-category-customer',
  [WorkspaceType.PROJECT]: 'marketplace-category-project',
  [WorkspaceType.USER]: 'marketplace-category-user',
};

export const WORKSPACE_ALL_CATEGORIES = {
  [WorkspaceType.ORGANIZATION]: 'marketplace-categories-customer',
  [WorkspaceType.PROJECT]: 'marketplace-categories-project',
  [WorkspaceType.USER]: 'marketplace-categories-user',
};

export const WORKSPACE_LANDING = {
  [WorkspaceType.ORGANIZATION]: 'marketplace-landing-customer',
  [WorkspaceType.PROJECT]: 'marketplace-landing-project',
  [WorkspaceType.USER]: 'marketplace-landing-user',
};

export const ANONYMOUS_LAYOUT_ROUTE_CONFIG = {
  hideHeader: false,
  skipAuth: true,
};
