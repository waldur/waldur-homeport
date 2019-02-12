import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { QueryChildProps } from '@waldur/core/Query';
import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ChangePlanComponent } from './ChangePlanComponent';
import { FetchedData } from './ChangePlanLoader';
import { switchPlan } from './store/constants';

const connectForm = reduxForm<{plan: any}, QueryChildProps<FetchedData>>({
  form: 'marketplaceChangePlan',
  validate: values => values.plan === undefined ? ({
    plan: translate('Plan is required'),
  }) : undefined,
});

const connectRedux = connect(undefined, (dispatch, ownProps: QueryChildProps<FetchedData>) => ({
  submitRequest: data => switchPlan({
    resource_uuid: ownProps.data.resource.uuid,
    plan_url: data.plan.url,
  }, dispatch),
}));

const connector = compose(connectForm, connectRedux);

interface DialogBodyProps extends QueryChildProps<FetchedData>, InjectedFormProps {
  error: any;
  submitRequest(data: any): void;
}

export const DialogBody = connector((props: DialogBodyProps) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={translate('Change resource plan')}
      footer={
        <>
          <CloseDialogButton/>
          {!props.loading && (
            <SubmitButton
              submitting={props.submitting}
              disabled={props.invalid}
              label={translate('Submit')}
            />
          )}
        </>
      }>
      {
        props.loading ? <LoadingSpinner/> :
        props.error ?  <h3>{translate('Unable to load data.')}</h3> :
        <ChangePlanComponent {...props.data}/>
      }
    </ModalDialog>
  </form>
));
