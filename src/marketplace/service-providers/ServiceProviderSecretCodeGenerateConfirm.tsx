import * as React from 'react';
import { connect } from 'react-redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { ServiceProvider } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';
import ActionButton from '@waldur/table-react/ActionButton';

import * as actions from './store/actions';

interface ServiceProviderSecretCodeRegenerateAlertProps extends TranslateProps {
  generateServiceProviderSecretCode(): void;
  resolve: {
    serviceProvider: ServiceProvider;
  };
}

const ServiceProviderSecretCodeRegenerateAlert = withTranslation((props: ServiceProviderSecretCodeRegenerateAlertProps) => (
  <ModalDialog title={props.translate('Alert')} footer={[
    <ActionButton  key="2" className="btn btn-success" icon="fa fa-check" title={props.translate('Regenerate')} action={props.generateServiceProviderSecretCode}/>,
    <CloseDialogButton key="1" className="btn btn-danger"/>,
  ]}>
    {props.translate('After secret API code has been regenerated, it will not be possible to submit usage with the old key.')}
  </ModalDialog>
));

const mapDispatchToProps = (dispatch, ownProps) => ({
  generateServiceProviderSecretCode: () => dispatch(actions.secretCodeRegenerateStart(ownProps.resolve.serviceProvider)),
});

export default connectAngularComponent(connect(null, mapDispatchToProps)(ServiceProviderSecretCodeRegenerateAlert), ['resolve']);
