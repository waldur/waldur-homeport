import { FunctionComponent } from 'react';

import { Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { ActionGroup } from '@/marketplace/resources/actions/ActionGroup';
import { ProviderActionContext } from '@/marketplace/resources/actions/ProviderActionContext';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { ActionItemType } from './types';

interface ResourceActionComponentProps {
  onToggle?: (isOpen: boolean) => void;
  disabled?: boolean;
  open?: boolean;
  loading?: boolean;
  error?: object;
  customerResourceActions?: ActionItemType[];
  providerResourceActions?: ActionItemType[];
  staffActions?: ActionItemType[];
  resourceTypeActions?: ActionItemType[];
  extraActions?: ActionItemType[];
  resource: any;
  scope?: any;
  marketplaceResource?: any;
  refetch?(): void;
  labeled?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'lg';
}

export const ResourceActionComponent: FunctionComponent<
  ResourceActionComponentProps
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
    <ActionsMenu
      toggle={props.labeled ? 'labeled' : 'kebab'}
      onOpenChange={props.onToggle}
      disabled={props.disabled}
      side={props.side}
      size={props.size}
    >
      {props.open ? (
        props.loading ? (
          <Menu.Item disabled>{translate('Loading actions')}</Menu.Item>
        ) : props.error ? (
          <Menu.Item disabled>{translate('Unable to load actions')}</Menu.Item>
        ) : props.customerResourceActions ||
          props.staffActions ||
          extraAndResourceTypeActions?.length > 0 ? (
          <>
            {/* If we also have Resource actions, move the extra and resource type actions into it. */}
            {extraAndResourceTypeActions?.length > 0 &&
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
        ) : (
          <Menu.Item disabled>{translate('There are no actions.')}</Menu.Item>
        )
      ) : null}
    </ActionsMenu>
  );
};
