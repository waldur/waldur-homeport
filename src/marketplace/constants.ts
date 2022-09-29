import {
  ORGANIZATION_WORKSPACE,
  PROJECT_WORKSPACE,
  USER_WORKSPACE,
} from '@waldur/workspace/types';

export const WORKSPACE_OFFERING_DETAILS = {
  [ORGANIZATION_WORKSPACE]: 'marketplace-offering-customer',
  [PROJECT_WORKSPACE]: 'marketplace-offering-project',
  [USER_WORKSPACE]: 'marketplace-offering-user',
};

export const WORKSPACE_CATEGORY = {
  [ORGANIZATION_WORKSPACE]: 'marketplace-category-customer',
  [PROJECT_WORKSPACE]: 'marketplace-category-project',
  [USER_WORKSPACE]: 'marketplace-category-user',
};

export const WORKSPACE_ALL_CATEGORIES = {
  [ORGANIZATION_WORKSPACE]: 'marketplace-categories-customer',
  [PROJECT_WORKSPACE]: 'marketplace-categories-project',
  [USER_WORKSPACE]: 'marketplace-categories-user',
};

export const WORKSPACE_LANDING = {
  [ORGANIZATION_WORKSPACE]: 'marketplace-landing-customer',
  [PROJECT_WORKSPACE]: 'marketplace-landing-project',
  [USER_WORKSPACE]: 'marketplace-landing-user',
};

export const ANONYMOUS_LAYOUT_ROUTE_CONFIG = {
  hideHeader: false,
  skipAuth: true,
};
