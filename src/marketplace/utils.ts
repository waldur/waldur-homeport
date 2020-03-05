import { ngInjector } from '@waldur/core/services';

export const marketplaceIsVisible = () =>
  ngInjector.get('features').isVisible('marketplace');

export const getCategoryLink = id =>
  `marketplace-project-resources({uuid: $ctrl.context.project.uuid, category_uuid: '${id}'})`;
