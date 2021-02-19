import { ComponentType, FunctionComponent } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
// import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
// import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
// import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
// import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
// import { EditAction } from '@waldur/support/EditAction';

interface ResourceActionComponentProps {
  onToggle: (isOpen: boolean) => void;
  disabled?: boolean;
  open?: boolean;
  loading?: boolean;
  error?: object;
  actions: ComponentType<{ resource; reInitResource }>[];
  resource: any;
  reInitResource?(): void;
}
/*
const ActionsList = [
  EditAction,
  SubmitReportAction,
  ChangePlanAction,
  SetBackendIdAction,
  TerminateAction,
];*/

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
            />
          ))}
        </>
      ) : (
        <MenuItem eventKey="2">{translate('There are no actions.')}</MenuItem>
      )
    ) : null}
  </DropdownButton>
);
