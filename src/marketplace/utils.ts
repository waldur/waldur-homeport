import { ngInjector } from '@waldur/core/services';

export const marketplaceIsVisible = () => ngInjector.get('features').isVisible('marketplace');
