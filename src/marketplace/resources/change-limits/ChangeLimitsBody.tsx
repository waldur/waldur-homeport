import { InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/registry';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ChangeLimitsComponent } from './ChangeLimitsComponent';
import { OwnProps, connector, StateProps } from './connector';

interface DialogBodyProps extends OwnProps, InjectedFormProps, StateProps {
  submitRequest(data: any): void;
  orderCanBeApproved: boolean;
  initialValues: { limits: Limits };
}

export const DialogBody = connector((props: DialogBodyProps) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={translate('Change resource limits')}
      footer={
        <>
          <CloseDialogButton />
          {!props.asyncState.loading && (
            <SubmitButton
              submitting={props.submitting}
              label={
                props.orderCanBeApproved
                  ? translate('Submit')
                  : translate('Request for a change')
              }
            />
          )}
        </>
      }
    >
      {props.asyncState.loading ? (
        <LoadingSpinner />
      ) : props.asyncState.error ? (
        <h3>{translate('Unable to load data.')}</h3>
      ) : (
        <ChangeLimitsComponent
          plan={props.asyncState.value.plan}
          periods={props.periods}
          components={props.components}
          orderCanBeApproved={props.orderCanBeApproved}
          totalPeriods={props.totalPeriods}
          offeringLimits={props.asyncState.value.offeringLimits}
        />
      )}
    </ModalDialog>
  </form>
));
