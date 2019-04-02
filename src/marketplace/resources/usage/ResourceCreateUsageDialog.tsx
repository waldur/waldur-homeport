import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { submitUsage } from '../store/constants';
import { ResourceUsageContainer } from './ResourceUsageContainer';
import { UsageReportContext } from './types';

interface ResourceCreateUsageDialogProps {
  resolve: UsageReportContext;
  submitReport(payload: object): void;
}

const connector = connect(null, (dispatch, ownProps: any) => ({
  submitReport: data => submitUsage({
    ...data,
    resource: ownProps.resolve.resource_uuid,
  }, dispatch),
}));

const enhance = compose(connector, reduxForm({form: 'ResourceUsageCreate'}));

const ResourceCreateUsageDialog = enhance((props: ResourceCreateUsageDialogProps & InjectedFormProps) => (
  <form onSubmit={props.handleSubmit(props.submitReport)}>
    <ModalDialog
      title={translate('Resource usage')}
      footer={
        <>
          <CloseDialogButton/>
          <SubmitButton
            submitting={props.submitting}
            label={translate('Submit usage report')}
          />
        </>
      }>
      <ResourceUsageContainer
        params={props.resolve}
        submitting={props.submitting}
      />
    </ModalDialog>
  </form>
));

export default connectAngularComponent(ResourceCreateUsageDialog, ['resolve']);
