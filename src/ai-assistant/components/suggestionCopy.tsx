import {
  ChartBarIcon,
  ChartLineUpIcon,
  CoinsIcon,
  CubeIcon,
  FileTextIcon,
  ListChecksIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  NotePencilIcon,
  PackageIcon,
  PauseCircleIcon,
  PresentationChartIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  StackIcon,
  TerminalWindowIcon,
  UserCircleIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import type { ChatSuggestionIdEnum } from 'waldur-js-client';

import { translate } from '@/i18n';

export interface SuggestionCopy {
  id: ChatSuggestionIdEnum;
  label: string;
  prompt: string;
  icon: ReactNode;
  // false: the prompt is the start of a question for the user to finish, so
  // it fills the composer instead of being sent.
  send: boolean;
}

// The backend decides which quick prompts a user is offered and in which
// order (GET /api/chat/suggestions/); the wording lives here. A Record over
// the SDK's id union makes tsc fail when the backend adds an id without copy.
// The start of a question the user finishes: the space is added here, not in
// the translation, where a translator could drop it.
const template = (text: string) => `${text.trimEnd()} `;

const COPY: Record<ChatSuggestionIdEnum, () => Omit<SuggestionCopy, 'id'>> = {
  resource_paused: () => ({
    label: translate('Why is my resource paused?'),
    prompt: translate('Why is my resource paused?'),
    icon: <PauseCircleIcon weight="bold" />,
    send: true,
  }),
  review_workload: () => ({
    label: translate('My reviews'),
    prompt: translate('Show my review workload'),
    icon: <ListChecksIcon weight="bold" />,
    send: true,
  }),
  proposal_help: () => ({
    label: translate('Help with my proposal'),
    prompt: translate('Help me with my draft proposal'),
    icon: <NotePencilIcon weight="bold" />,
    send: true,
  }),
  pending_orders: () => ({
    label: translate('Pending orders'),
    prompt: translate('Which of my orders are pending?'),
    icon: <ShoppingCartIcon weight="bold" />,
    send: true,
  }),
  check_credit: () => ({
    label: translate('Check my credit'),
    prompt: translate('How much credit do I have left?'),
    icon: <CoinsIcon weight="bold" />,
    send: true,
  }),
  my_resources: () => ({
    label: translate('My resources'),
    prompt: translate('Show my resources'),
    icon: <StackIcon weight="bold" />,
    send: true,
  }),
  analyze_usage: () => ({
    label: translate('Analyze usage'),
    prompt: translate('Analyze my current usage'),
    icon: <ChartBarIcon weight="bold" />,
    send: true,
  }),
  create_vm: () => ({
    label: translate('Create VM'),
    prompt: translate('I want to create a VM'),
    icon: <CubeIcon weight="bold" />,
    send: true,
  }),
  hpc_jobs: () => ({
    label: translate('My HPC jobs'),
    prompt: translate('Show my recent HPC jobs'),
    icon: <TerminalWindowIcon weight="bold" />,
    send: true,
  }),
  find_service: () => ({
    label: translate('Find a service'),
    prompt: template(translate('Help me find a service for')),
    icon: <MagnifyingGlassIcon weight="bold" />,
    send: false,
  }),
  find_call: () => ({
    label: translate('Find a matching call'),
    prompt: template(translate('Find open calls that match my research on')),
    icon: <MegaphoneIcon weight="bold" />,
    send: false,
  }),
  search_docs: () => ({
    label: translate('Search docs'),
    prompt: template(translate('How do I')),
    icon: <FileTextIcon weight="bold" />,
    send: false,
  }),
  visualize_costs: () => ({
    label: translate('Visualize costs'),
    prompt: translate('Show a chart of my monthly costs'),
    icon: <ChartLineUpIcon weight="bold" />,
    send: true,
  }),
  list_invoices: () => ({
    label: translate('My invoices'),
    prompt: translate('Show my recent invoices'),
    icon: <ReceiptIcon weight="bold" />,
    send: true,
  }),
  hpc_software: () => ({
    label: translate('Find HPC software'),
    prompt: template(translate('Is this software available on the cluster:')),
    icon: <PackageIcon weight="bold" />,
    send: false,
  }),
  call_insights: () => ({
    label: translate('Call insights'),
    prompt: translate('Show insights for the active calls'),
    icon: <PresentationChartIcon weight="bold" />,
    send: true,
  }),
  overdrawn_projects: () => ({
    label: translate('Overdrawn projects'),
    prompt: translate('Which projects are overdrawn?'),
    icon: <WarningIcon weight="bold" />,
    send: true,
  }),
  look_up_user: () => ({
    label: translate('Look up a user'),
    prompt: template(translate('Look up the user')),
    icon: <UserCircleIcon weight="bold" />,
    send: false,
  }),
};

// Ids are offered in the backend's order; one this build has no copy for
// (a newer backend) is skipped rather than shown blank.
export const getSuggestionCopy = (ids: readonly string[]): SuggestionCopy[] =>
  ids
    .filter((id): id is ChatSuggestionIdEnum =>
      Object.prototype.hasOwnProperty.call(COPY, id),
    )
    .map((id) => ({ id, ...COPY[id]() }));
