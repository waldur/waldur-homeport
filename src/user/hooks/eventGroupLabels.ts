import { EventGroupsEnum } from 'waldur-js-client';

import { translate } from '@/i18n';

export type EventGroupSection =
  'access' | 'organizations' | 'billing' | 'resources' | 'support';

interface EventGroupLabel {
  title: () => string;
  description: () => string;
  section: EventGroupSection;
}

export const EVENT_GROUP_SECTIONS: Record<EventGroupSection, () => string> = {
  access: () => translate('Account and access'),
  organizations: () => translate('Organizations and projects'),
  billing: () => translate('Billing'),
  resources: () => translate('Resources'),
  support: () => translate('Support'),
};

// Exhaustive on purpose: a new backend group fails the type check here
// instead of rendering a label derived from its raw key.
export const EVENT_GROUP_LABELS: Record<EventGroupsEnum, EventGroupLabel> = {
  auth: {
    section: 'access',
    title: () => translate('Sign-ins and access tokens'),
    description: () =>
      translate(
        'Sign-ins, sign-outs, failed sign-in attempts, passkeys and personal access tokens.',
      ),
  },
  users: {
    section: 'access',
    title: () => translate('User accounts'),
    description: () =>
      translate(
        'User accounts being created, updated, activated, deactivated or deleted, and offering user accounts.',
      ),
  },
  ssh: {
    section: 'access',
    title: () => translate('SSH keys'),
    description: () => translate('SSH keys being added or removed.'),
  },
  permissions: {
    section: 'access',
    title: () => translate('Roles and permissions'),
    description: () =>
      translate(
        'Roles being granted, changed or revoked, and role definitions.',
      ),
  },
  terms_of_service: {
    section: 'access',
    title: () => translate('Terms of service'),
    description: () =>
      translate('Consent to the terms of service being given or withdrawn.'),
  },
  onboarding: {
    section: 'access',
    title: () => translate('Onboarding'),
    description: () => translate('Onboarding verifications being removed.'),
  },
  access_subnets: {
    section: 'access',
    title: () => translate('Access subnets'),
    description: () =>
      translate(
        'Allowed network ranges being added, changed or removed for organizations and offerings.',
      ),
  },
  admin: {
    section: 'access',
    title: () => translate('Admin panel changes'),
    description: () =>
      translate(
        'Records being created, changed or deleted in the admin panel.',
      ),
  },
  customers: {
    section: 'organizations',
    title: () => translate('Organizations'),
    description: () =>
      translate(
        'Organizations being created, updated or deleted, and changes to their credits and allowed offerings.',
      ),
  },
  projects: {
    section: 'organizations',
    title: () => translate('Projects'),
    description: () =>
      translate(
        'Projects being created, updated or deleted, change requests and permission reviews.',
      ),
  },
  call: {
    section: 'organizations',
    title: () => translate('Calls'),
    description: () =>
      translate('Call documents being added or removed and reviewer workload.'),
  },
  proposal: {
    section: 'organizations',
    title: () => translate('Proposals'),
    description: () =>
      translate(
        'Proposals advancing through review, being canceled, and their documents.',
      ),
  },
  review: {
    section: 'organizations',
    title: () => translate('Reviews'),
    description: () => translate('Proposal reviews being canceled.'),
  },
  invoices: {
    section: 'billing',
    title: () => translate('Invoices'),
    description: () =>
      translate(
        'Invoices and invoice items being created, changed, paid or canceled.',
      ),
  },
  credits: {
    section: 'billing',
    title: () => translate('Credits'),
    description: () =>
      translate(
        'Organization and project credits being granted, reduced, adjusted or rolled back.',
      ),
  },
  offering_accounting: {
    section: 'billing',
    title: () => translate('Offering accounting'),
    description: () =>
      translate('Offering components, plans and prices being changed.'),
  },
  policies: {
    section: 'billing',
    title: () => translate('Cost and usage policies'),
    description: () =>
      translate('Cost and usage policies being created, changed or deleted.'),
  },
  resources: {
    section: 'resources',
    title: () => translate('Resources and orders'),
    description: () =>
      translate(
        'Orders and resources being created, changed, paused or terminated, including backups and limit changes.',
      ),
  },
  providers: {
    section: 'resources',
    title: () => translate('Provider resources'),
    description: () =>
      translate(
        'Resources of your offerings being requested, changed or terminated, for service providers.',
      ),
  },
  openstack_resources: {
    section: 'resources',
    title: () => translate('OpenStack resources'),
    description: () =>
      translate(
        'OpenStack instances, volumes, load balancers and other tenant resources.',
      ),
  },
  openstack_network: {
    section: 'resources',
    title: () => translate('OpenStack networks'),
    description: () =>
      translate(
        'OpenStack networks being created, updated, imported or deleted.',
      ),
  },
  openstack_subnet: {
    section: 'resources',
    title: () => translate('OpenStack subnets'),
    description: () =>
      translate(
        'OpenStack subnets being created, updated or deleted, and their host routes.',
      ),
  },
  openstack_router: {
    section: 'resources',
    title: () => translate('OpenStack routers'),
    description: () =>
      translate('OpenStack routers being updated and their interfaces.'),
  },
  openstack_port: {
    section: 'resources',
    title: () => translate('OpenStack ports'),
    description: () =>
      translate(
        'OpenStack ports being created, updated or deleted, and their security settings.',
      ),
  },
  openstack_floating_ip: {
    section: 'resources',
    title: () => translate('OpenStack floating IPs'),
    description: () =>
      translate('OpenStack floating IPs being attached, detached or updated.'),
  },
  openstack_security_group: {
    section: 'resources',
    title: () => translate('OpenStack security groups'),
    description: () =>
      translate('OpenStack security groups and their rules being changed.'),
  },
  openstack_rbac: {
    section: 'resources',
    title: () => translate('OpenStack network sharing'),
    description: () =>
      translate('OpenStack RBAC policies being created or deleted.'),
  },
  support: {
    section: 'support',
    title: () => translate('Support requests'),
    description: () =>
      translate(
        'Support requests and their attachments being created, updated or deleted.',
      ),
  },
  chat: {
    section: 'support',
    title: () => translate('AI assistant'),
    description: () =>
      translate(
        'Assistant chats being accessed, flagged for personal data or prompt injection, and feedback.',
      ),
  },
};
