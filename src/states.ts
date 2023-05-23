import { states as administrationRoutes } from '@waldur/administration/routes';
import { states as authCallbackRoutes } from '@waldur/auth/callbacks/routes';
import { states as authRoutes } from '@waldur/auth/routes';
import { states as customerRoutes } from '@waldur/customer/routes';
import { states as errorRoutes } from '@waldur/error/routes';
import { states as invitationsRoutes } from '@waldur/invitations/routes';
import { states as invoicesRoutes } from '@waldur/invoices/routes';
import { states as issuesRoutes } from '@waldur/issues/routes';
import { states as marketplaceChecklistRoutes } from '@waldur/marketplace-checklist/routes';
import { states as marketplaceRemoteRoutes } from '@waldur/marketplace-remote/routes';
import { states as marketplaceRoutes } from '@waldur/marketplace/routes';
import { states as openstackAnalyticsRoutes } from '@waldur/openstack/analytics/routes';
import { states as paypalRoutes } from '@waldur/paypal/routes';
import { states as projectRoutes } from '@waldur/project/routes';
import { states as rancherRoutes } from '@waldur/rancher/routes';
import { states as resourceRoutes } from '@waldur/resource/routes';
import { states as resourceSupportRoutes } from '@waldur/resource/support/routes';
import { states as supportRoutes } from '@waldur/support/routes';
import { states as userRoutes } from '@waldur/user/routes';

import { states as aboutRoutes } from './about';
import { StateDeclaration } from './core/types';
// Errors module should be the last, because it contains special route.
// Route with url='*path' allows to display error page without redirect.

export const states: StateDeclaration[] = [
  ...authRoutes,
  ...authCallbackRoutes,
  ...customerRoutes,
  ...projectRoutes,
  ...userRoutes,
  ...invitationsRoutes,
  ...invoicesRoutes,
  ...issuesRoutes,
  ...marketplaceRoutes,
  ...marketplaceChecklistRoutes,
  ...marketplaceRemoteRoutes,
  ...administrationRoutes,
  ...supportRoutes,
  ...openstackAnalyticsRoutes,
  ...paypalRoutes,
  ...rancherRoutes,
  ...resourceRoutes,
  ...resourceSupportRoutes,
  ...aboutRoutes,
  ...errorRoutes,
];
