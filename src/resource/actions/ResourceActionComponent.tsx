import { FunctionComponent } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ActionItem } from './types';

interface ResourceActionComponentProps {
  onToggle: (isOpen: boolean) => void;
  disabled?: boolean;
  open?: boolean;
  loading?: boolean;
  error?: object;
  actions: ActionItem[];
  resource: any;
  reInitResource?(): void;
  refreshList?(): void;
}

export const ResourceActionComponent: FunctionComponent<ResourceActionComponentProps> = (
  props,
) => (
  <DropdownButton
    title={translate('Actions')}
    id="actions-dropdown-btn"
    className="dropdown-btn"
    onToggle={props.onToggle}
    open={props.open}
    disabled={props.disabled}
    pullRight={window.innerWidth > 768}
  >
    {props.open ? (
      props.loading ? (
        <MenuItem eventKey="1">{translate('Loading actions')}</MenuItem>
      ) : props.error ? (
        <MenuItem eventKey="1">{translate('Unable to load actions')}</MenuItem>
      ) : props.actions ? (
        <>
          {props.actions.map((ActionComponent, index) => (
            <ActionComponent
              key={index}
              resource={props.resource}
              reInitResource={props.reInitResource}
              refreshList={props.refreshList}
            />
          ))}
        </>
      ) : (
        <MenuItem eventKey="2">{translate('There are no actions.')}</MenuItem>
      )
    ) : null}
  </DropdownButton>
);
