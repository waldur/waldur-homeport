import * as React from 'react';
import { connect } from 'react-redux';
import { AsyncState } from 'react-use/lib/useAsync';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { orderCanBeApproved } from '@waldur/marketplace/orders/store/selectors';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { switchPlan } from '../store/constants';

import { ChangePlanComponent } from './ChangePlanComponent';
import { FetchedData } from './utils';

const FORM_ID = 'marketplaceChangePlan';

const mapStateToProps = (state) => ({
  orderCanBeApproved: orderCanBeApproved(state),
});

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  submitRequest: (data) =>
    switchPlan(
      {
        marketplace_resource_uuid: ownProps.asyncState.value.resource.uuid,
        resource_uuid: ownProps.asyncState.value.resource.resource_uuid,
        resource_type: ownProps.asyncState.value.resource.resource_type,
        plan_url: data.plan.url,
      },
      dispatch,
    ),
});

const connector = compose(
  reduxForm<{ plan: any }, OwnProps>({ form: FORM_ID }),
  connect(mapStateToProps, mapDispatchToProps),
);

interface OwnProps {
  asyncState: AsyncState<FetchedData>;
}

interface DialogBodyProps extends OwnProps, InjectedFormProps {
  submitRequest(data: any): void;
  orderCanBeApproved: boolean;
}

export const DialogBody = connector((props: DialogBodyProps) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={translate('Change resource plan')}
      footer={
        <>
          <CloseDialogButton />
          {!props.asyncState.loading && (
            <SubmitButton
              submitting={props.submitting}
              disabled={!props.asyncState.value.initialValues}
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
        <ChangePlanComponent {...props.asyncState.value} />
      )}
    </ModalDialog>
  </form>
));
