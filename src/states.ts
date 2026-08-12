import { states as administrationRoutes } from '@/administration/routes';
import { states as authCallbackRoutes } from '@/auth/callbacks/routes';
import { states as authRoutes } from '@/auth/routes';
import { states as customerRoutes } from '@/customer/routes';
import { states as errorRoutes } from '@/error/routes';
import { states as invitationsRoutes } from '@/invitations/routes';
import { states as invoicesRoutes } from '@/invoices/routes';
import { states as issuesRoutes } from '@/issues/routes';
import { states as marketplaceRoutes } from '@/marketplace/routes';
import { states as marketplaceChecklistRoutes } from '@/marketplace-checklist/routes';
import { states as marketplaceRemoteRoutes } from '@/marketplace-remote/routes';
import { states as openportalRoutes } from '@/openportal/routes';
import { states as projectRoutes } from '@/project/routes';
import { states as proposalsRoutes } from '@/proposals/routes';
import { states as providerHelpdeskRoutes } from '@/provider-helpdesk/routes';
import { states as rancherRoutes } from '@/rancher/routes';
import { states as reportingRoutes } from '@/reporting/routes';
import { states as userRoutes } from '@/user/routes';

import { states as aboutRoutes } from './about';
import { StateDeclaration } from './core/types';
// Errors module should be the last, because it contains special route.
// Route with url='*path' allows to display error page without redirect.

export const states: StateDeclaration[] = [
  ...authRoutes,
  ...authCallbackRoutes,
  ...customerRoutes,
  ...projectRoutes,
  ...proposalsRoutes,
  ...userRoutes,
  ...invitationsRoutes,
  ...invoicesRoutes,
  ...issuesRoutes,
  ...marketplaceRoutes,
  ...providerHelpdeskRoutes,
  ...marketplaceChecklistRoutes,
  ...marketplaceRemoteRoutes,
  ...administrationRoutes,
  ...rancherRoutes,
  ...reportingRoutes,
  ...openportalRoutes,
  ...aboutRoutes,
  ...errorRoutes,
];
