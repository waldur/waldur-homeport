import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
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
  resource: any;
  marketplaceResource?: any;
  refetch?(): void;
  labeled?: boolean;
}

export const ResourceActionComponent: FunctionComponent<
  ResourceActionComponentProps
> = (props) => {
  const user = useSelector(getUser);
  return (
    <ActionsDropdownComponent
      labeled={props.labeled}
      onToggle={props.onToggle}
      disabled={props.disabled}
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
          props.resourceTypeActions ? (
          <>
            {props.resourceTypeActions?.length > 0 && (
              <>
                {props.resourceTypeActions.map((ActionComponent, index) => (
                  <ActionComponent
                    key={`resource-${index}`}
                    resource={props.resource}
                    marketplaceResource={props.marketplaceResource}
                    refetch={props.refetch}
                  />
                ))}
              </>
            )}
            {props.customerResourceActions?.length > 0 && (
              <>
                <Dropdown.Header>
                  {translate('Resource actions')}
                </Dropdown.Header>
                {props.customerResourceActions.map((ActionComponent, index) => (
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
            {props.staffActions.length > 0 && user.is_staff && (
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
