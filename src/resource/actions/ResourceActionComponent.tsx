import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
import { DropDirection } from 'react-bootstrap/esm/DropdownContext';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

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
  marketplaceResource?: any;
  refetch?(): void;
  labeled?: boolean;
  drop?: DropDirection;
}

export const ResourceActionComponent: FunctionComponent<
  ResourceActionComponentProps
> = (props) => {
  const user = useSelector(getUser);

  const extraAndResourceTypeActions = (props.extraActions || []).concat(
    props.resourceTypeActions || [],
  );

  return (
    <ActionsDropdownComponent
      labeled={props.labeled}
      onToggle={props.onToggle}
      disabled={props.disabled}
      drop={props.drop}
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
                  resource={props.resource}
                  marketplaceResource={props.marketplaceResource}
                  refetch={props.refetch}
                />
              ))}
            {props.customerResourceActions?.length > 0 && (
              <>
                <Dropdown.Header>
                  {translate('Resource actions')}
                </Dropdown.Header>
                {props.customerResourceActions
                  .concat(extraAndResourceTypeActions)
                  .map((ActionComponent, index) => (
                    <ActionComponent
                      key={`resource-${index}`}
                      resource={props.resource}
                      marketplaceResource={props.marketplaceResource}
                      refetch={props.refetch}
                    />
                  ))}
              </>
            )}
            {props.providerResourceActions && (
              <>
                <Dropdown.Header>
                  {translate('Provider actions')}
                </Dropdown.Header>
                {props.providerResourceActions.map((ActionComponent, index) => (
                  <ActionComponent
                    key={`provider-${index}`}
                    resource={props.resource}
                    marketplaceResource={props.marketplaceResource}
                    refetch={props.refetch}
                  />
                ))}
              </>
            )}
            {props.staffActions?.length > 0 && user.is_staff && (
              <>
                <Dropdown.Header>{translate('Staff actions')}</Dropdown.Header>
                {props.staffActions.map((ActionComponent, index) => (
                  <ActionComponent
                    key={`staff-${index}`}
                    resource={props.resource}
                    marketplaceResource={props.marketplaceResource}
                    refetch={props.refetch}
                  />
                ))}
              </>
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
