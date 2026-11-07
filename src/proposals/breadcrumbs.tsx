import { useMemo } from 'react';

import { IBreadcrumbItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { usePresetBreadcrumbItems } from '@/navigation/header/breadcrumb/utils';
import { requestListState, requestListTitle } from '@/proposals/presentation';
import { ProposalBreadcrumbPopover } from '@/proposals/proposal/ProposalBreadcrumbPopover';
import { getMyWorkTitle } from '@/proposals/review/myWorkTitle';
import { Call, Proposal } from '@/proposals/types';

/**
 * Where a single request sits, for the applicant looking at it.
 *
 * The page sets `hideHeaderMenu`, and for an applicant holding no reviewer or
 * call-manager role the role tab bar does not render either, so without this
 * the request is a dead end with no way back but the browser button.
 *
 * The chain is Profile -> the request list -> this request. Not by way of the
 * list's resource lens: that shows the individual resource asks *inside* a
 * request, so routing through it would put the child above the parent and
 * tell the applicant the opposite of how the two relate.
 *
 * `requestListState` rather than a fixed route because the list lives under
 * the calls section in one mode and under the profile in the other, and
 * `requestListTitle` so the crumb and the page it opens agree.
 */
export const useProposalBreadcrumbItems = (
  proposal: Pick<Proposal, 'name'>,
): IBreadcrumbItem[] =>
  useMemo(
    () => [
      {
        key: 'profile',
        text: translate('Profile'),
        to: 'profile.details',
      },
      {
        key: 'request-list',
        text: requestListTitle(),
        to: requestListState(),
        ellipsis: 'xl',
      },
      {
        key: 'proposal',
        // No maxLength: BreadcrumbItem middle-truncates the active crumb
        // itself and ignores the prop there.
        text: proposal?.name || '...',
        active: true,
      },
    ],
    [proposal?.name],
  );

/**
 * Where a proposal sits for someone working on it who is not on its team --
 * an evaluator, or someone a contribution was handed to: their own work,
 * which is where they came from, not the applicant's list of proposals.
 */
export const useParticipantProposalBreadcrumbItems = (
  user: Parameters<typeof getMyWorkTitle>[0],
  proposal: Pick<Proposal, 'name'>,
): IBreadcrumbItem[] =>
  useMemo(
    () => [
      {
        key: 'profile',
        text: translate('Profile'),
        to: 'profile.details',
      },
      {
        key: 'my-work',
        text: getMyWorkTitle(user),
        to: 'reviews-tasks',
        ellipsis: 'xl',
      },
      {
        key: 'proposal',
        // No maxLength: BreadcrumbItem middle-truncates the active crumb
        // itself and ignores the prop there.
        text: proposal?.name || '...',
        active: true,
      },
    ],
    [user, proposal?.name],
  );

/**
 * Where a single proposal sits, for the call team looking at it.
 *
 * The applicant's chain runs through their own profile; this one runs down the
 * structure that owns the proposal — organisation, its calls, the call, the
 * round — which is the path a call manager actually navigated to get here and
 * the one they need back.
 *
 * The round carries no link: rounds have no page of their own, they are a
 * section inside the call, so the crumb names where the proposal sits without
 * promising somewhere to go.
 */
export const useCallManagedProposalBreadcrumbItems = (
  call: Pick<Call, 'uuid' | 'customer_uuid' | 'customer_name' | 'name'>,
  proposal: Pick<Proposal, 'name' | 'round'>,
): IBreadcrumbItem[] => {
  const { getOrganizationsBreadcrumbItem, getOrganizationBreadcrumbItem } =
    usePresetBreadcrumbItems();

  return useMemo(
    () => [
      getOrganizationsBreadcrumbItem(),
      call?.customer_uuid
        ? getOrganizationBreadcrumbItem({
            uuid: call.customer_uuid,
            name: call?.customer_name || '...',
          })
        : { key: 'organization.dashboard', text: '...' },
      // No 'Calls for proposals' crumb between the organisation and the call:
      // five crumbs already overflow the header at common widths, and the
      // Breadcrumbs component answers overflow by folding *everything* between
      // the first and last into a popover — which would hide the call and the
      // round, the two this chain exists to show. The call crumb leads into
      // the call anyway, and its list is one level up from there.
      {
        key: 'call',
        text: call?.name || '...',
        to: 'protected-call.manage',
        params: call ? { call_uuid: call.uuid } : undefined,
        maxLength: 28,
        ellipsis: 'xl',
      },
      {
        key: 'round',
        text: proposal?.round?.name || '...',
        maxLength: 24,
        ellipsis: 'xl',
      },
      {
        key: 'proposal',
        // No maxLength: BreadcrumbItem middle-truncates the active crumb
        // itself and ignores the prop there.
        text: proposal?.name || '...',
        // Sibling proposals in the same round, the way the resource crumb
        // offers sibling resources.
        dropdown: (close) => (
          <ProposalBreadcrumbPopover
            proposal={proposal as Proposal}
            customerUuid={call?.customer_uuid}
            close={close}
          />
        ),
        active: true,
      },
    ],
    [call, proposal],
  );
};

/**
 * Where a proposal sits for a provider who opened it from its proposals:
 * the organisation, its proposals, this one. Not the applicant's chain
 * through the profile, which is not where the provider came from.
 */
export const useProviderProposalBreadcrumbItems = (
  provider: { uuid: string; name?: string },
  proposal: Pick<Proposal, 'name'>,
): IBreadcrumbItem[] => {
  const { getOrganizationsBreadcrumbItem, getOrganizationBreadcrumbItem } =
    usePresetBreadcrumbItems();

  return useMemo(
    () => [
      getOrganizationsBreadcrumbItem(),
      getOrganizationBreadcrumbItem({
        uuid: provider.uuid,
        name: provider.name || '...',
      }),
      {
        key: 'provider-proposals',
        text: translate('Proposals'),
        to: 'marketplace-provider-call-proposals',
        params: { uuid: provider.uuid },
      },
      {
        key: 'proposal',
        // No maxLength: BreadcrumbItem middle-truncates the active crumb
        // itself and ignores the prop there.
        text: proposal?.name || '...',
        active: true,
      },
    ],
    [provider.uuid, provider.name, proposal?.name],
  );
};

/**
 * Where a proposal sits for someone who opened it from an organisation's
 * published call results -- an organisation reader, say: the organisation,
 * its call results, this one. They hold no tasks page and are not on the
 * proposal's team, so neither of those chains leads back.
 */
export const useResultsProposalBreadcrumbItems = (
  organization: { uuid: string; name?: string },
  proposal: Pick<Proposal, 'name'>,
): IBreadcrumbItem[] => {
  const { getOrganizationsBreadcrumbItem, getOrganizationBreadcrumbItem } =
    usePresetBreadcrumbItems();

  return useMemo(
    () => [
      getOrganizationsBreadcrumbItem(),
      getOrganizationBreadcrumbItem({
        uuid: organization.uuid,
        name: organization.name || '...',
      }),
      {
        key: 'call-results',
        text: translate('Call results'),
        to: 'organization.call-results',
        params: { uuid: organization.uuid },
      },
      {
        key: 'proposal',
        text: proposal?.name || '...',
        active: true,
      },
    ],
    [organization.uuid, organization.name, proposal?.name],
  );
};
