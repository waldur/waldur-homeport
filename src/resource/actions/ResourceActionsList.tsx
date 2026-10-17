import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { ActionGroup } from '@/marketplace/resources/actions/ActionGroup';
import { EditResourceEndDateAction } from '@/marketplace/resources/actions/EditResourceEndDateAction';
import { EditResourceEndDateByProviderAction } from '@/marketplace/resources/actions/EditResourceEndDateByProviderAction';
import { ProviderActionContext } from '@/marketplace/resources/actions/ProviderActionContext';
import { useUser } from '@/workspace/hooks';

import { ActionItemType } from './types';

// Provider actions that are a consumer action under another name. Both
// "Set termination date" entries call the same set_end_date code with the same
// validation and notification; they differ only in whether the permission is
// held on the offering side or the project side. Someone holding it on both
// would see the one capability twice. Applied only where the consumer group
// renders too: the provider console lists provider actions alone.
const SUPERSEDED_BY_CONSUMER_ACTION = new Map<ActionItemType, ActionItemType>([
  [EditResourceEndDateByProviderAction, EditResourceEndDateAction],
]);

export interface ResourceActionsListProps {
  customerResourceActions?: ActionItemType[];
  providerResourceActions?: ActionItemType[];
  staffActions?: ActionItemType[];
  resourceTypeActions?: ActionItemType[];
  extraActions?: ActionItemType[];
  resource: any;
  scope?: any;
  marketplaceResource?: any;
  refetch?(): void;
}

/**
 * Every action a resource has, in its three groups. Rendered twice: in the
 * row menu, where an enclosing ActionList shows only the important ones, and
 * in the "Show all" dialog, where the same ActionList shows them all with a
 * search box. Each action filters itself (see isActionVisible), so the two
 * callers differ only in the filter they provide.
 */
export const ResourceActionsList: FunctionComponent<
  ResourceActionsListProps
> = (props) => {
  const user = useUser();

  const extraAndResourceTypeActions = (props.extraActions || []).concat(
    props.resourceTypeActions || [],
  );

  const customerActions = props.customerResourceActions?.length
    ? props.customerResourceActions.concat(extraAndResourceTypeActions)
    : [];

  // An action may be listed for both audiences - Pull, for example. Render it
  // once, in the group the user sees first, so a combined menu has no doubles.
  // The same goes for a provider action that is the consumer one reached
  // through the other side's permission (see SUPERSEDED_BY_CONSUMER_ACTION).
  const providerActions = (props.providerResourceActions || []).filter(
    (action) =>
      !customerActions.includes(action) &&
      !customerActions.includes(SUPERSEDED_BY_CONSUMER_ACTION.get(action)),
  );

  return (
    <>
      {/* If we also have Resource actions, move the extra and resource type actions into it. */}
      {extraAndResourceTypeActions.length > 0 &&
        !props.customerResourceActions?.length &&
        extraAndResourceTypeActions.map((ActionComponent, index) => (
          <ActionComponent
            key={`resource-${index}`}
            resource={props.scope || props.resource}
            marketplaceResource={props.marketplaceResource}
            refetch={props.refetch}
          />
        ))}
      {customerActions.length > 0 && (
        <ActionGroup title={translate('Resource actions')}>
          {customerActions.map((ActionComponent, index) => (
            <ActionComponent
              key={`resource-${index}`}
              resource={
                props.extraActions?.includes(ActionComponent)
                  ? props.scope || props.resource
                  : props.resource
              }
              marketplaceResource={props.marketplaceResource}
              refetch={props.refetch}
            />
          ))}
        </ActionGroup>
      )}
      {providerActions.length > 0 && (
        <ProviderActionContext.Provider value={true}>
          <ActionGroup title={translate('Provider actions')}>
            {providerActions.map((ActionComponent, index) => (
              <ActionComponent
                key={`provider-${index}`}
                resource={props.resource}
                marketplaceResource={props.marketplaceResource}
                refetch={props.refetch}
              />
            ))}
          </ActionGroup>
        </ProviderActionContext.Provider>
      )}
      {props.staffActions?.length > 0 && user.is_staff && (
        <ActionGroup title={translate('Staff actions')}>
          {props.staffActions.map((ActionComponent, index) => (
            <ActionComponent
              key={`staff-${index}`}
              resource={props.resource}
              marketplaceResource={props.marketplaceResource}
              refetch={props.refetch}
            />
          ))}
        </ActionGroup>
      )}
    </>
  );
};
