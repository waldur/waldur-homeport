import { StorefrontIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, Fragment } from 'react';
import { User } from 'waldur-js-client';

import { SidebarMenuAccordion, SidebarMenuSeparator } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermissionOnAnyOfferingOf } from '@/permissions/hasPermission';
import { OFFERING_TEAM_PROPOSAL_STATE } from '@/proposals/proposal/proposalView';
import { checkCanAccessServiceProvider } from '@/workspace/selectors';

import { MenuItem } from './MenuItem';
import {
  countBadge,
  useProviderPendingRequestsCount,
  useProviderTasksCount,
} from './useProviderCallCounts';

interface ManagedProvider {
  uuid: string;
  name: string;
  offerings: { uuid: string; name: string }[];
}

const OFFERING_EVALUATOR = 'OFFERING.EVALUATOR';

/**
 * The providers on whose offerings the user holds a role but whose provider
 * workspace they cannot open: an offering manager has no organization role,
 * so without this they have no way into the pages that serve their offerings.
 * Staff, support and anyone who can open the workspace reach those pages
 * through it, so they get nothing here.
 */
export const getManagedOfferingProviders = (
  user: Pick<User, 'is_staff' | 'is_support' | 'permissions'> | undefined,
): ManagedProvider[] => {
  if (!user || user.is_staff || user.is_support) {
    return [];
  }
  const providers = new Map<string, ManagedProvider>();
  for (const grant of user.permissions ?? []) {
    if (grant.scope_type !== 'offering' || !grant.customer_uuid) {
      continue;
    }
    // An offering evaluator manages nothing of the offering: the call work
    // handed to them reaches them through My tasks.
    if (grant.role_name === OFFERING_EVALUATOR) {
      continue;
    }
    if (
      checkCanAccessServiceProvider({ uuid: grant.customer_uuid }, user as User)
    ) {
      continue;
    }
    const provider = providers.get(grant.customer_uuid) ?? {
      uuid: grant.customer_uuid,
      name: grant.customer_name,
      offerings: [],
    };
    if (!provider.offerings.some(({ uuid }) => uuid === grant.scope_uuid)) {
      provider.offerings.push({
        uuid: grant.scope_uuid,
        name: grant.scope_name,
      });
    }
    providers.set(grant.customer_uuid, provider);
  }
  return [...providers.values()];
};

/**
 * The provider's calls and requests for offerings, each counting what waits
 * for the user: their own tasks, and requests nobody answered yet.
 */
const ProviderCallsEntries: FC<{
  provider: ManagedProvider;
  label: (provider: ManagedProvider, title: string) => string;
  activeFor: (provider: ManagedProvider, names: string[]) => string;
}> = ({ provider, label, activeFor }) => {
  const pending = useProviderPendingRequestsCount(provider.uuid);
  const tasks = useProviderTasksCount(provider.uuid);
  return (
    <>
      {isFeatureVisible(
        MarketplaceFeatures.show_call_management_functionality,
      ) ? (
        <MenuItem
          title={label(provider, translate('Calls'))}
          state="marketplace-provider-calls"
          params={{ uuid: provider.uuid }}
          activeState={activeFor(provider, [
            'marketplace-provider-calls',
            'marketplace-provider-call-tasks',
            'marketplace-provider-call-proposals',
            'marketplace-provider-call-demand',
            OFFERING_TEAM_PROPOSAL_STATE,
          ])}
          badge={countBadge(tasks)}
        />
      ) : null}
      <MenuItem
        title={label(provider, translate('Requests for offerings'))}
        state="marketplace-provider-offering-requests"
        params={{ uuid: provider.uuid }}
        badge={countBadge(pending)}
      />
    </>
  );
};

interface ManagedOfferingsMenuProps {
  user: User;
  disabled?: boolean;
  disabledTooltip?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ManagedOfferingsMenu: FC<ManagedOfferingsMenuProps> = ({
  user,
  disabled,
  disabledTooltip,
  open,
  onOpenChange,
}) => {
  const { state, params } = useCurrentStateAndParams();
  const providers = getManagedOfferingProviders(user);
  if (!providers.length) {
    return null;
  }
  // With several providers each item says whose it is.
  const label = (provider: ManagedProvider, title: string) =>
    providers.length > 1 ? `${title}: ${provider.name}` : title;
  const activeFor = (provider: ManagedProvider, names: string[]) =>
    params.uuid === provider.uuid && names.includes(state.name)
      ? state.name
      : undefined;

  return (
    <SidebarMenuAccordion
      title={translate('Managed offerings')}
      icon={<StorefrontIcon weight="bold" />}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
      open={open}
      onOpenChange={onOpenChange}
    >
      {providers.map((provider, index) => (
        <Fragment key={provider.uuid}>
          {index > 0 ? <SidebarMenuSeparator /> : null}
          {provider.offerings.map((offering) => (
            <MenuItem
              key={offering.uuid}
              title={offering.name}
              state="marketplace-offering-details"
              params={{ uuid: provider.uuid, offering_uuid: offering.uuid }}
            />
          ))}
          {hasPermissionOnAnyOfferingOf(
            user,
            provider.uuid,
            PermissionEnum.LIST_ORDERS,
          ) && !isFeatureVisible(MarketplaceFeatures.catalogue_only) ? (
            <MenuItem
              title={label(provider, translate('Orders'))}
              state="marketplace-provider-orders"
              params={{ uuid: provider.uuid }}
            />
          ) : null}
          <MenuItem
            title={label(provider, translate('Resources'))}
            state="marketplace-public-resources"
            params={{ uuid: provider.uuid }}
            activeState={activeFor(provider, [
              'marketplace-public-resources',
              'marketplace-provider-resource-details',
            ])}
          />
          {hasPermissionOnAnyOfferingOf(
            user,
            provider.uuid,
            PermissionEnum.ACCEPT_REQUESTED_OFFERING,
          ) ? (
            <ProviderCallsEntries
              provider={provider}
              label={label}
              activeFor={activeFor}
            />
          ) : null}
        </Fragment>
      ))}
    </SidebarMenuAccordion>
  );
};
