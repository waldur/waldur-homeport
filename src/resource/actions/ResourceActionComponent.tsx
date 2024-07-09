import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { ActionItemType } from './types';

interface ResourceActionComponentProps {
  onToggle?: (isOpen: boolean) => void;
  disabled?: boolean;
  open?: boolean;
  loading?: boolean;
  error?: object;
  actions: ActionItemType[];
  resource: any;
  marketplaceResource?: any;
  refetch?(): void;
}

export const ResourceActionComponent: FunctionComponent<
  ResourceActionComponentProps
> = (props) => (
  <ActionsDropdownComponent onToggle={props.onToggle} disabled={props.disabled}>
    {props.open ? (
      props.loading ? (
        <Dropdown.Item eventKey="1">
          {translate('Loading actions')}
        </Dropdown.Item>
      ) : props.error ? (
        <Dropdown.Item eventKey="1">
          {translate('Unable to load actions')}
        </Dropdown.Item>
      ) : props.actions ? (
        <>
          {props.actions.map((ActionComponent, index) => (
            <ActionComponent
              key={index}
              resource={props.resource}
              marketplaceResource={props.marketplaceResource}
              refetch={props.refetch}
            />
          ))}
        </>
      ) : (
        <Dropdown.Item eventKey="2">
          {translate('There are no actions.')}
        </Dropdown.Item>
      )
    ) : null}
  </ActionsDropdownComponent>
);
