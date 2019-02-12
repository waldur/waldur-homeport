import * as React from 'react';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query, QueryChildProps } from '@waldur/core/Query';
import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { ChangePlanComponent } from './ChangePlanComponent';
import { loadData, FetchedData } from './ChangePlanLoader';

interface ChangePlanDialogProps {
  resolve: {
    resource: {
      marketplace_resource_uuid: string;
    };
  };
  submitting: boolean;
}

const connector = reduxForm<{plan: any}, QueryChildProps<FetchedData>>({
  form: 'marketplaceChangePlan',
  validate: values => values.plan === undefined ? ({
    plan: 'Plan is required',
  }) : undefined,
  onSubmit: values => alert(JSON.stringify(values)),
});

const DialogBody = connector((props: QueryChildProps<FetchedData> & InjectedFormProps) => (
  <form onSubmit={props.handleSubmit}>
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

export const ChangePlanDialog: React.SFC<ChangePlanDialogProps> = props => (
  <Query
    variables={{resource_uuid: props.resolve.resource.marketplace_resource_uuid}}
    loader={loadData}
  >
    {queryProps => <DialogBody {...queryProps} initialValues={queryProps.data ? queryProps.data.initialValues : undefined}/>}
  </Query>
);

export default connectAngularComponent(ChangePlanDialog, ['resolve']);
