import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { QueryChildProps } from '@waldur/core/Query';
import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/registry';
import { orderCanBeApproved } from '@waldur/marketplace/orders/store/selectors';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { changeLimits } from '../store/constants';
import { ChangeLimitsComponent } from './ChangeLimitsComponent';
import { FetchedData } from './utils';

const FORM_ID = 'marketplaceChangeLimits';

const mapStateToProps = state => ({
  orderCanBeApproved: orderCanBeApproved(state),
});

const mapDispatchToProps = (dispatch, ownProps: QueryChildProps<FetchedData>) => ({
  submitRequest: data => changeLimits({
    marketplace_resource_uuid: ownProps.data.resource.uuid,
    resource_uuid: ownProps.data.resource.resource_uuid,
    resource_type: ownProps.data.resource.resource_type,
    limits: ownProps.data.limitSerializer(data.limits),
  }, dispatch),
});

const connector = compose(
  reduxForm<{plan: any, limits: Limits}, QueryChildProps<FetchedData>>({form: FORM_ID}),
  connect(mapStateToProps, mapDispatchToProps),
);

interface DialogBodyProps extends QueryChildProps<FetchedData>, InjectedFormProps {
  error: any;
  submitRequest(data: any): void;
  orderCanBeApproved: boolean;
  initialValues: {limits: Limits};
}

export const DialogBody = connector((props: DialogBodyProps) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={translate('Change resource limits')}
      footer={
        <>
          <CloseDialogButton/>
          {!props.loading && (
            <SubmitButton
              submitting={props.submitting}
              label={props.orderCanBeApproved ? translate('Submit') : translate('Request for a change')}
            />
          )}
        </>
      }>
      {
        props.loading ? <LoadingSpinner/> :
        props.error ?  <h3>{translate('Unable to load data.')}</h3> :
        <ChangeLimitsComponent {...props.data}/>
      }
    </ModalDialog>
  </form>
));
