import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
import { DropDirection } from 'react-bootstrap/esm/DropdownContext';

import { translate } from '@/i18n';
import { ActionGroup } from '@/marketplace/resources/actions/ActionGroup';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
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
  drop?: DropDirection;
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
    <ActionsDropdownComponent
      labeled={props.labeled}
      onToggle={props.onToggle}
      disabled={props.disabled}
      drop={props.drop}
      size={props.size}
    >
      {props.open ? (
        props.loading ? (
          <Dropdown.Item eventKey="1">
            {translate('Loading actions')}
          </Dropdown.Item>
        ) : props.error ? (
          <Dropdown.Item eventKey="1">
            {translate('Unable to load actions')}
          </Dropdown.Item>
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
          <Dropdown.Item eventKey="2">
            {translate('There are no actions.')}
          </Dropdown.Item>
        )
      ) : null}
    </ActionsDropdownComponent>
  );
};
