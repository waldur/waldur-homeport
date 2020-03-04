import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { QueryChildProps } from '@waldur/core/Query';
import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { orderCanBeApproved } from '@waldur/marketplace/orders/store/selectors';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { switchPlan } from '../store/constants';

import { ChangePlanComponent } from './ChangePlanComponent';
import { FetchedData } from './utils';

const FORM_ID = 'marketplaceChangePlan';

const mapStateToProps = state => ({
  orderCanBeApproved: orderCanBeApproved(state),
});

const mapDispatchToProps = (
  dispatch,
  ownProps: QueryChildProps<FetchedData>,
) => ({
  submitRequest: data =>
    switchPlan(
      {
        marketplace_resource_uuid: ownProps.data.resource.uuid,
        resource_uuid: ownProps.data.resource.resource_uuid,
        resource_type: ownProps.data.resource.resource_type,
        plan_url: data.plan.url,
      },
      dispatch,
    ),
});

const connector = compose(
  reduxForm<{ plan: any }, QueryChildProps<FetchedData>>({ form: FORM_ID }),
  connect(mapStateToProps, mapDispatchToProps),
);

interface DialogBodyProps
  extends QueryChildProps<FetchedData>,
    InjectedFormProps {
  error: any;
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
          {!props.loading && (
            <SubmitButton
              submitting={props.submitting}
              disabled={!props.data.initialValues}
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
      {props.loading ? (
        <LoadingSpinner />
      ) : props.error ? (
        <h3>{translate('Unable to load data.')}</h3>
      ) : (
        <ChangePlanComponent {...props.data} />
      )}
    </ModalDialog>
  </form>
));
