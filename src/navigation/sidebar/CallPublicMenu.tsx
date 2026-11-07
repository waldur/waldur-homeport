import {
  ChatTeardropTextIcon,
  FileTextIcon,
  ListChecksIcon,
  MegaphoneIcon,
} from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, ReactNode } from 'react';

import { SidebarMenuAccordion, SidebarMenuSeparator } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { getServiceAccessMode } from '@/marketplace/serviceAccessMode';
import { MenuItem } from '@/navigation/sidebar/MenuItem';
import { RoleEnum } from '@/permissions/enums';
import { canReadAllCallWork } from '@/proposals/callOperators';
import { getMyWorkTitle, isReviewer } from '@/proposals/review/myWorkTitle';
import { useMyTasksCount } from '@/proposals/review/useMyTasksCount';
import { useReviewerProfile } from '@/reviewer/useReviewerProfile';
import { useUser } from '@/workspace/hooks';

import { CallsSidebarItem, getCallsSidebarItem } from './sidebarSection';
import {
  countBadge,
  useProviderPendingRequestsCount,
  useProviderTasksCount,
} from './useProviderCallCounts';
import {
  ProviderCallScope,
  useProviderCallScopes,
} from './useProviderCallScopes';

/**
 * The user's own call work, opening on their tasks and counting them. Named
 * after what most of it is: reviews for a reviewer, tasks for an offering
 * manager or an applicant. Left out while nothing waits for someone who
 * does not review: the page would be empty.
 */
const MyReviewsMenuItem: FC<{
  activeState?: string;
  icon?: ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
}> = ({ activeState, icon, disabled, disabledTooltip }) => {
  const tasksCount = useMyTasksCount();
  const user = useUser();
  // Someone who does not review has only the tasks waiting now on that
  // page -- an applicant answering a step, staff overseeing through Call
  // management -- so with none it is offered once one arrives.
  // While its pages are open the entry stays, to mark where the user is.
  if (tasksCount === 0 && !isReviewer(user) && !activeState) {
    return null;
  }
  return (
    <MenuItem
      title={getMyWorkTitle(user)}
      state="reviews-tasks"
      activeState={activeState}
      badge={tasksCount > 0 ? tasksCount : undefined}
      icon={icon}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
    />
  );
};

/**
 * One provider's calls entry, counting what waits for the user there: its
 * requests to answer and the user's own tasks on its offerings.
 */
const ProviderCallsMenuItem: FC<{
  provider: ProviderCallScope;
  title: string;
  activeState?: string;
}> = ({ provider, title, activeState }) => {
  const pending = useProviderPendingRequestsCount(provider.uuid);
  const tasks = useProviderTasksCount(provider.uuid);
  return (
    <MenuItem
      title={title}
      state="marketplace-provider-calls"
      params={{ uuid: provider.uuid }}
      activeState={activeState}
      badge={countBadge(pending + tasks)}
    />
  );
};

/**
 * The calls the user's provider organisations take part in, one entry per
 * provider. With several, each names its provider, the way Managed offerings
 * does; the one open lights up.
 */
const ProviderCallsMenuItems: FC<{
  providers: ProviderCallScope[];
  active: boolean;
  currentUuid?: string;
  activeStateName?: string;
}> = ({ providers, active, currentUuid, activeStateName }) => (
  <>
    {providers.map((provider) => (
      <ProviderCallsMenuItem
        key={provider.uuid}
        provider={provider}
        title={
          providers.length > 1
            ? translate('Provider calls: {provider}', {
                provider: provider.name,
              })
            : translate('Provider calls')
        }
        activeState={
          active && currentUuid === provider.uuid ? activeStateName : undefined
        }
      />
    ))}
  </>
);

/**
 * The organisations whose calls this user manages.
 *
 * A call-manager permission already carries the organisation that runs the
 * call, so the manager's own surface can be linked without asking the API
 * again. One entry per organisation, not per call: managing three calls for
 * one council is the common case and must not read as three destinations.
 *
 * Empty for everyone else — reviewers and panel members have work on a call
 * but nothing to manage.
 */
export const getCallManagerCustomerUuids = (user): string[] => [
  ...new Set<string>(
    (user?.permissions ?? [])
      .filter(
        (permission) =>
          permission.scope_type === 'call' &&
          permission.role_name === RoleEnum.CALL_MANAGER &&
          permission.customer_uuid,
      )
      .map((permission) => permission.customer_uuid as string),
  ),
];

/**
 * A call organizer's CUSTOMER.CALL_ORGANIZER role is bound to the
 * CallManagingOrganisation, so it never appears as a call-scoped CALL.MANAGER
 * row and a manager-only scan misses it entirely — leaving a role that ships
 * with CALL.UPDATE and CALL.LIST no entry point to the calls it runs.
 */
const isCallOrganizer = (user): boolean =>
  Boolean(
    user?.permissions?.some(
      (permission) => permission.scope_type === 'call_organizer',
    ),
  );

/**
 * Whether this user has any calls to manage.
 *
 * Staff and support hold no call-scoped roles — their reach comes from the
 * flags, not from permission rows — so a permission scan alone would leave
 * them with no entry point at all.
 *
 * The destination does not depend on the answer: `manage-calls` lists the
 * calls the user can manage, whichever organisation runs them, because the
 * protected calls endpoint is already scoped by role. An earlier version sent
 * anyone with more than one organisation to the organisations list, which
 * answered "which calls do I run" with "here is every organisation, work it
 * out" — and for staff that is every organisation on the deployment.
 */
export const canManageCalls = (user): boolean =>
  Boolean(user?.is_staff) ||
  Boolean(user?.is_support) ||
  isCallOrganizer(user) ||
  getCallManagerCustomerUuids(user).length > 0;

/**
 * Anyone holding a role on a call — managing it, sitting on its panel, or the
 * API-only CALL.REVIEWER. Used to keep the operator surface reachable in
 * marketplace mode, where applicants get no calls section at all.
 *
 * Reviewers assigned through the pool hold no call role and are not caught
 * here; they reach their reviews through their reviewer profile instead.
 */
const hasCallRole = (user) =>
  user?.permissions?.some(
    (permission) =>
      permission.scope_type === 'call' &&
      [
        RoleEnum.CALL_MANAGER,
        RoleEnum.CALL_REVIEWER,
        RoleEnum.CALL_PANEL_MEMBER,
      ].includes(permission.role_name),
  );

/**
 * Which entry of the calls area the current page belongs to, shared by the
 * Calls accordion and, in calls-only mode, the top-level entries.
 */
const useCallsMenuState = () => {
  const { state, params } = useCurrentStateAndParams();
  const user = useUser();
  // Owners of a provider whose offerings are in calls, and offering managers.
  const providers = useProviderCallScopes();
  // Managers get their own calls; everyone else gets the catalogue, named as
  // the browsing surface it is rather than as management they cannot do.
  const showManageCalls = canManageCalls(user);
  // The highlighted entry is the one the current route names in its
  // `sidebarItem`, inherited from the root of its area, so every page of
  // an area lights up the same entry and the accordion is never open with
  // nothing highlighted. Call pages belong to Manage calls; without that
  // entry they fall back to the catalogue the call was found in.
  // A proposal opened as an offering's team names its provider in the route,
  // under the provider's entry.
  const currentItem: CallsSidebarItem | undefined = getCallsSidebarItem(state);
  const activeItem: CallsSidebarItem | undefined =
    currentItem === 'manage-calls' && !showManageCalls
      ? 'calls-for-proposals'
      : currentItem;
  const activeFor = (item: CallsSidebarItem) =>
    activeItem === item ? state.name : undefined;
  return {
    state,
    params,
    user,
    providers,
    showManageCalls,
    activeItem,
    activeFor,
  };
};

interface CallsModeEntriesProps {
  disabled?: boolean;
  disabledTooltip?: string;
}

/**
 * Calls-only mode's first entries: calls are the only way in, so the public
 * list is one click away rather than inside an accordion, and so are the
 * user's own proposals and tasks -- with the tasks' count always in sight.
 * Calls run outside Waldur (call_only) have no proposals or tasks here, so
 * the list is all there is.
 */
export const CallsModeEntries: FC<CallsModeEntriesProps> = ({
  disabled,
  disabledTooltip,
}) => {
  const { activeFor } = useCallsMenuState();
  const browse = (
    <MenuItem
      title={translate('Calls for proposals')}
      state="calls-for-proposals-dashboard"
      activeState={activeFor('calls-for-proposals')}
      icon={<MegaphoneIcon weight="bold" />}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
    />
  );
  if (isFeatureVisible(MarketplaceFeatures.call_only)) {
    return browse;
  }
  return (
    <>
      {browse}
      <MenuItem
        title={translate('My proposals')}
        state="proposals-all-proposals"
        activeState={activeFor('my-proposals')}
        icon={<FileTextIcon weight="bold" />}
        disabled={disabled}
        disabledTooltip={disabledTooltip}
      />
      <MyReviewsMenuItem
        activeState={activeFor('my-reviews')}
        icon={<ListChecksIcon weight="bold" />}
        disabled={disabled}
        disabledTooltip={disabledTooltip}
      />
    </>
  );
};

interface CallPublicMenuProps {
  disabled?: boolean;
  disabledTooltip?: string;
  /** Threaded from UnifiedSidebar's own top-level useExclusiveOpen —
   * forwarded onto whichever of the three mutually-exclusive
   * `itemId="calls-menu"` MenuAccordion variants below actually renders. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CallPublicMenu: FC<CallPublicMenuProps> = ({
  disabled,
  disabledTooltip,
  open,
  onOpenChange,
}) => {
  const {
    state,
    params,
    user,
    providers,
    showManageCalls,
    activeItem,
    activeFor,
  } = useCallsMenuState();

  const mode = getServiceAccessMode();

  const isOperator = user?.is_staff || user?.is_support || hasCallRole(user);
  const showCallManagement = isFeatureVisible(
    MarketplaceFeatures.show_call_management_functionality,
  );
  // Workflow work does not need a call role: an offering's team assesses its
  // own offering on every call that requests it. Shared with My reviews' badge,
  // so it costs no request of its own.
  const tasksCount = useMyTasksCount();
  const providerCallsItems = providers.length ? (
    <ProviderCallsMenuItems
      providers={providers}
      active={activeItem === 'provider-calls'}
      currentUuid={params?.uuid}
      activeStateName={state.name}
    />
  ) : null;
  const hasCallWork = isOperator || tasksCount > 0 || providers.length > 0;
  // A reviewer-pool member holds no call role, so in marketplace mode the
  // reviewer profile is the only sign they have reviews to reach.
  const { profile: reviewerProfile } = useReviewerProfile({
    enabled: mode === 'marketplace' && !hasCallWork && showCallManagement,
  });
  const browseCallsItem = (
    <MenuItem
      title={translate('Calls for proposals')}
      state="calls-for-proposals-dashboard"
      activeState={activeFor('calls-for-proposals')}
    />
  );
  const manageCallsItem = showManageCalls ? (
    <MenuItem
      title={translate('Manage calls')}
      state="manage-calls"
      activeState={activeFor('manage-calls')}
    />
  ) : null;

  // Marketplace-only: applicants reach services through offerings and track
  // their proposals in the profile, so they get no calls section.
  //
  // Operators still do. Whether a deployment runs calls at all is
  // show_call_management_functionality, a separate axis from how applicants
  // browse — a marketplace-only portal can still be backed by calls, and the
  // people running them need somewhere to stand. Pool reviewers, who hold no
  // call role, get just a "My reviews" link.
  if (mode === 'marketplace') {
    if (!showCallManagement) {
      return null;
    }
    if (!hasCallWork) {
      if (!reviewerProfile) {
        return null;
      }
      return (
        <>
          <SidebarMenuSeparator />
          <MenuItem
            title={translate('My reviews')}
            state="reviews-all-reviews"
            icon={<ChatTeardropTextIcon weight="bold" />}
            disabled={disabled}
            disabledTooltip={disabledTooltip}
            activeState={activeFor('my-reviews')}
          />
        </>
      );
    }
    // Titled by the job, not by the object: a marketplace-only deployment does
    // not present itself as running calls for proposals, but the items below
    // still open calls, proposals and reviews — so the objects keep their
    // names and only the grouping is reframed.
    //
    // UnifiedSidebar renders this last in marketplace mode; the separator
    // belongs here rather than there so it disappears along with the menu for
    // users who are not operators.
    return (
      <>
        <SidebarMenuSeparator />
        <SidebarMenuAccordion
          title={translate('Access management')}
          icon={<ChatTeardropTextIcon weight="bold" />}
          disabled={disabled}
          disabledTooltip={disabledTooltip}
          open={open}
          onOpenChange={onOpenChange}
        >
          {manageCallsItem}
          {/* Someone here only for their tasks has no call to browse to. */}
          {isOperator ? browseCallsItem : null}
          <MyReviewsMenuItem activeState={activeFor('my-reviews')} />
          {providerCallsItems}
          {canReadAllCallWork(user) && (
            <>
              <SidebarMenuSeparator />
              <MenuItem
                title={translate('All proposals')}
                state="admin-proposals"
                activeState={activeFor('all-proposals')}
              />
              <MenuItem
                title={translate('All reviews')}
                state="admin-reviews"
                activeState={activeFor('all-reviews')}
              />
            </>
          )}
        </SidebarMenuAccordion>
      </>
    );
  }

  const showAdminItems = canReadAllCallWork(user);
  const adminItems = showAdminItems ? (
    <>
      <SidebarMenuSeparator />
      <MenuItem
        title={translate('All proposals')}
        state="admin-proposals"
        activeState={activeFor('all-proposals')}
      />
      <MenuItem
        title={translate('All reviews')}
        state="admin-reviews"
        activeState={activeFor('all-reviews')}
      />
    </>
  ) : null;

  // Calls-only: browsing calls and one's own proposals and tasks are
  // top-level entries (CallsModeEntries), so this is only what operators
  // have -- and nothing at all for anyone else, nor for calls run outside
  // Waldur (call_only), which have nothing to manage here.
  if (mode === 'calls') {
    if (
      isFeatureVisible(MarketplaceFeatures.call_only) ||
      !showCallManagement ||
      !(manageCallsItem || providerCallsItems || adminItems)
    ) {
      return null;
    }
    // UnifiedSidebar starts the operator part of the sidebar with this; the
    // separator lives here so it goes when the menu does.
    return (
      <>
        <SidebarMenuSeparator />
        <SidebarMenuAccordion
          title={translate('Call management')}
          icon={<ChatTeardropTextIcon weight="bold" />}
          disabled={disabled}
          disabledTooltip={disabledTooltip}
          open={open}
          onOpenChange={onOpenChange}
        >
          {manageCallsItem}
          {providerCallsItems}
          {adminItems}
        </SidebarMenuAccordion>
      </>
    );
  }

  // 'both' from here: the calls section sits beside the marketplace. Whether
  // it carries the management items is a separate question from the mode.
  if (!showCallManagement) {
    return (
      <SidebarMenuAccordion
        title={translate('Proposals')}
        icon={<ChatTeardropTextIcon weight="bold" />}
        disabled={disabled}
        disabledTooltip={disabledTooltip}
        open={open}
        onOpenChange={onOpenChange}
      >
        {/* Beside a marketplace, calls are found through its offerings. */}
        <MenuItem
          title={translate('My proposals')}
          state="proposals-all-proposals"
          activeState={activeFor('my-proposals')}
        />
        <MyReviewsMenuItem activeState={activeFor('my-reviews')} />
      </SidebarMenuAccordion>
    );
  }

  return (
    <SidebarMenuAccordion
      title={translate('Calls')}
      icon={<ChatTeardropTextIcon weight="bold" />}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
      open={open}
      onOpenChange={onOpenChange}
    >
      {manageCallsItem}
      {browseCallsItem}

      <MenuItem
        title={translate('My proposals')}
        state="proposals-all-proposals"
        activeState={activeFor('my-proposals')}
      />

      <MyReviewsMenuItem activeState={activeFor('my-reviews')} />

      {providerCallsItems}

      {adminItems}
    </SidebarMenuAccordion>
  );
};
