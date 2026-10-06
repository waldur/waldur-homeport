import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { ActionGroup } from '@/marketplace/resources/actions/ActionGroup';
import { ProviderActionContext } from '@/marketplace/resources/actions/ProviderActionContext';
import { useUser } from '@/workspace/hooks';

import { ActionItemType } from './types';

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
  const providerActions = (props.providerResourceActions || []).filter(
    (action) => !customerActions.includes(action),
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
