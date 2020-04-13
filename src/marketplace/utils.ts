import { ngInjector } from '@waldur/core/services';

export const marketplaceIsVisible = () =>
  ngInjector.get('features').isVisible('marketplace');

export const getCategoryLink = (projectId, categoryId) => ({
  state: 'marketplace-project-resources',
  params: {
    uuid: projectId,
    category_uuid: categoryId,
  },
});
