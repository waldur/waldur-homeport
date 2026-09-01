import {
  BuildingsIcon,
  ChartPieSliceIcon,
  ClipboardTextIcon,
  LifebuoyIcon,
  MegaphoneSimpleIcon,
  PackageIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@phosphor-icons/react';
import { translate } from 'waldur-i18n-runtime';
import { ModeOption } from 'waldur-ui';

/**
 * The eight workspaces the mode switcher offers — titles, descriptions
 * and order taken verbatim from the mockup, icon tints mapped onto
 * badgeColors.css's existing variants rather than a new pastel palette.
 *
 * Built by a function, not a module constant, so its translate() calls
 * re-resolve on each render once the dictionary loads — same reason
 * OrgDashboardMock.tsx rebuilds its own columns array every render.
 */
export const getWorkspaceModes = (): ModeOption[] => [
  {
    key: 'end-user',
    title: translate('End user'),
    description: translate(
      'For researchers and individual members who need to request and manage their own resources.',
    ),
    icon: <UserCircleIcon size={22} weight="bold" />,
    variant: 'blue',
  },
  {
    key: 'service-provider',
    title: translate('Service provider'),
    description: translate(
      'For teams that provide cloud resources to customers through the Waldur marketplace.',
    ),
    icon: <PackageIcon size={22} weight="bold" />,
    variant: 'purple',
  },
  {
    key: 'proposal-reviewer',
    title: translate('Proposal reviewer'),
    description: translate(
      'For reviewers evaluating submitted proposals for open calls.',
    ),
    icon: <ClipboardTextIcon size={22} weight="bold" />,
    variant: 'warning',
  },
  {
    key: 'organisation-admin',
    title: translate('Organisation admin'),
    description: translate(
      'For organisation administrators managing projects, members, quotas and invoices.',
    ),
    icon: <BuildingsIcon size={22} weight="bold" />,
    variant: 'moss',
  },
  {
    key: 'call-manager',
    title: translate('Call manager'),
    description: translate('Open and close calls, manage proposal lifecycles.'),
    icon: <MegaphoneSimpleIcon size={22} weight="bold" />,
    variant: 'indigo',
  },
  {
    key: 'finance-reporting',
    title: translate('Finance & reporting'),
    description: translate(
      'Invoices, cost analytics and financial reporting across organisations.',
    ),
    icon: <ChartPieSliceIcon size={22} weight="bold" />,
    // 'blue', not 'info' — Metronic's own $info is purple (badgeColors.css
    // inherits that), which would have made this tile a second copy of
    // Service provider's. The mockup shows both this and End user in blue.
    variant: 'blue',
  },
  {
    key: 'support-agent',
    title: translate('Support agent'),
    description: translate(
      'Handle customer support tickets and investigate issues via audit logs.',
    ),
    icon: <LifebuoyIcon size={22} weight="bold" />,
    variant: 'danger',
  },
  {
    key: 'platform-admin',
    title: translate('Platform admin'),
    description: translate(
      'The full Waldur HomePort with every section. Use this for tasks that span domains.',
    ),
    icon: <ShieldCheckIcon size={22} weight="bold" />,
    variant: 'neutral',
  },
];

/**
 * The sidebar mode card's subtitle. The picker's sentences describe who a
 * mode is *for*, which is far too long under a 300px sidebar's mode name,
 * so each mode also carries this short form — condensed from that same
 * sentence's own words, not from any assumption about what the mode
 * contains. 'finance-reporting' and 'organisation-admin' are the two the
 * mockups state outright ("Invoices, cost analytics" and "Projects,
 * members, invoices"); the rest follow the same rule.
 */
export const getModeSubtitle = (key: string): string =>
  ({
    'end-user': translate('Resources and requests'),
    'service-provider': translate('Marketplace, customers'),
    'proposal-reviewer': translate('Proposals, open calls'),
    'organisation-admin': translate('Projects, members, invoices'),
    'call-manager': translate('Calls, proposal lifecycles'),
    'finance-reporting': translate('Invoices, cost analytics'),
    'support-agent': translate('Support tickets, audit logs'),
    'platform-admin': translate('Every section'),
  })[key] ?? '';
