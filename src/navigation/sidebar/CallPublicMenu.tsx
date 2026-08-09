import { ChatTeardropTextIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { getServiceAccessMode } from '@/marketplace/serviceAccessMode';
import { MenuAccordion } from '@/navigation/sidebar/MenuAccordion';
import { MenuItem } from '@/navigation/sidebar/MenuItem';
import { RoleEnum } from '@/permissions/enums';
import { useUser } from '@/workspace/hooks';

import { isDescendantOf } from '../useTabs';

const hasCallManagerRole = (user) =>
  user?.permissions?.some(
    (permission) =>
      permission.scope_type === 'call' &&
      permission.role_name === RoleEnum.CALL_MANAGER,
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
  getCallManagerCustomerUuids(user).length > 0;

/**
 * Anyone with work to do on a call — managing it, reviewing for it, sitting on
 * its panel. Used to keep the operator surface reachable in marketplace mode,
 * where applicants get no calls section at all.
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

interface CallPublicMenuProps {
  disabled?: boolean;
  disabledTooltip?: string;
}

export const CallPublicMenu: FC<CallPublicMenuProps> = ({
  disabled,
  disabledTooltip,
}) => {
  const { state } = useCurrentStateAndParams();
  const user = useUser();

  const mode = getServiceAccessMode();

  const isOperator = user?.is_staff || user?.is_support || hasCallRole(user);
  // Managers get their own calls; everyone else gets the catalogue, named as
  // the browsing surface it is rather than as management they cannot do.
  const showManageCalls = canManageCalls(user);
  const browseCallsItem = (
    <MenuItem
      title={translate('Calls for proposals')}
      state="calls-for-proposals-dashboard"
      activeState={
        ['calls-for-proposals', 'protected-call', 'public-calls'].some((name) =>
          isDescendantOf(name, state),
        )
          ? state.name
          : undefined
      }
    />
  );
  const manageCallsItem = showManageCalls ? (
    <MenuItem
      title={translate('Manage calls')}
      state="manage-calls"
      activeState={
        isDescendantOf('call-management', state) ||
        state.name === 'manage-calls'
          ? state.name
          : undefined
      }
    />
  ) : null;

  // Marketplace-only: applicants reach services through offerings and track
  // their proposals in the profile, so they get no calls section.
  //
  // Operators still do. Whether a deployment runs calls at all is
  // show_call_management_functionality, a separate axis from how applicants
  // browse — a marketplace-only portal can still be backed by calls, and the
  // people running them need somewhere to stand.
  if (mode === 'marketplace') {
    if (
      !isOperator ||
      !isFeatureVisible(MarketplaceFeatures.show_call_management_functionality)
    ) {
      return null;
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
        <div className="menu-separator my-2" />
        <MenuAccordion
          title={translate('Access management')}
          itemId="calls-menu"
          icon={<ChatTeardropTextIcon weight="bold" />}
          disabled={disabled}
          disabledTooltip={disabledTooltip}
        >
          {manageCallsItem}
          {browseCallsItem}
          <MenuItem
            title={translate('My reviews')}
            state="reviews-all-reviews"
            activeState={
              isDescendantOf('reviews', state) ? state.name : undefined
            }
          />
          {(user?.is_staff || user?.is_support || hasCallManagerRole(user)) && (
            <>
              <div className="menu-separator my-2" />
              <MenuItem
                title={translate('All proposals')}
                state="admin-proposals"
              />
              <MenuItem
                title={translate('All reviews')}
                state="admin-reviews"
              />
            </>
          )}
        </MenuAccordion>
      </>
    );
  }

  // Calls-only: one link, since there is no marketplace to sit beside.
  if (mode === 'calls') {
    return (
      <MenuItem
        title={translate('Calls for proposals')}
        state="calls-for-proposals-dashboard"
        icon={<ChatTeardropTextIcon weight="bold" />}
        child={false}
        disabled={disabled}
        disabledTooltip={disabledTooltip}
      />
    );
  }

  // 'both' from here: the calls section sits beside the marketplace. Whether
  // it carries the management items is a separate question from the mode.
  if (
    !isFeatureVisible(MarketplaceFeatures.show_call_management_functionality)
  ) {
    return (
      <MenuAccordion
        title={translate('Proposals')}
        itemId="calls-menu"
        icon={<ChatTeardropTextIcon weight="bold" />}
        disabled={disabled}
        disabledTooltip={disabledTooltip}
      >
        <MenuItem
          title={translate('My proposals')}
          state="proposals-all-proposals"
          activeState={
            isDescendantOf('proposals', state) ? state.name : undefined
          }
        />
        <MenuItem
          title={translate('My reviews')}
          state="reviews-all-reviews"
          activeState={
            isDescendantOf('reviews', state) ? state.name : undefined
          }
        />
      </MenuAccordion>
    );
  }

  const showAdminItems =
    user?.is_staff || user?.is_support || hasCallManagerRole(user);

  return (
    <MenuAccordion
      title={translate('Calls')}
      itemId="calls-menu"
      icon={<ChatTeardropTextIcon weight="bold" />}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
    >
      {manageCallsItem}
      {browseCallsItem}

      <MenuItem
        title={translate('My proposals')}
        state="proposals-all-proposals"
        activeState={
          isDescendantOf('proposals', state) ? state.name : undefined
        }
      />

      <MenuItem
        title={translate('My reviews')}
        state="reviews-all-reviews"
        activeState={isDescendantOf('reviews', state) ? state.name : undefined}
      />

      {showAdminItems && (
        <>
          <div className="menu-separator my-2" />
          <MenuItem
            title={translate('All proposals')}
            state="admin-proposals"
          />
          <MenuItem title={translate('All reviews')} state="admin-reviews" />
        </>
      )}
    </MenuAccordion>
  );
};
