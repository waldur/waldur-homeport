import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ServiceProvider } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ActionButton } from '@waldur/table/ActionButton';

import * as actions from './store/actions';

interface ServiceProviderSecretCodeRegenerateAlertProps {
  generateServiceProviderSecretCode(): void;
  resolve: {
    serviceProvider: ServiceProvider;
  };
}

const ServiceProviderSecretCodeRegenerateAlert = (
  props: ServiceProviderSecretCodeRegenerateAlertProps,
) => (
  <ModalDialog
    title={translate('Alert')}
    footer={[
      <ActionButton
        key="2"
        className="btn btn-success"
        icon="fa fa-check"
        title={translate('Regenerate')}
        action={props.generateServiceProviderSecretCode}
      />,
      <CloseDialogButton key="1" className="btn btn-danger" />,
    ]}
  >
    {translate(
      'After secret API code has been regenerated, it will not be possible to submit usage with the old key.',
    )}
  </ModalDialog>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  generateServiceProviderSecretCode: () =>
    dispatch(
      actions.secretCodeRegenerateStart(ownProps.resolve.serviceProvider),
    ),
});

export const ServiceProviderSecretCodeGenerateConfirm = connect(
  null,
  mapDispatchToProps,
)(ServiceProviderSecretCodeRegenerateAlert);
