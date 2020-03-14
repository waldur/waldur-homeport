import * as React from 'react';
import { connect } from 'react-redux';

import { TranslateProps } from '@waldur/i18n';
import { SecretValueField } from '@waldur/marketplace/SecretValueField';
import { ServiceProvider } from '@waldur/marketplace/types';
import { ActionButton } from '@waldur/table-react/ActionButton';

import './ServiceProviderSecretCode.scss';

import * as actions from './store/actions';
import * as selectors from './store/selectors';

interface ServiceProviderSecretCodeProps extends TranslateProps {
  serviceProvider: ServiceProvider;
  secretCode: {
    code: string;
    generating: boolean;
  };
  showSuccess?(message: string): void;
  showError?(message: string): void;
  showSecretCodeRegenerateConfirm(): void;
  getServiceProviderSecretCode(): void;
}

class PureServiceProviderSecretCode extends React.Component<
  ServiceProviderSecretCodeProps
> {
  componentDidUpdate(prevProps) {
    if (
      this.props.serviceProvider &&
      prevProps.serviceProvider !== this.props.serviceProvider
    ) {
      this.props.getServiceProviderSecretCode();
    }
  }

  render() {
    return (
      <div className="service-provider-secret-code m-t-xs">
        <div className="service-provider-secret-code__label">
          {this.props.translate('API secret code:')}
        </div>
        <div className="service-provider-secret-code__value m-l-xs">
          <SecretValueField value={this.props.secretCode.code} />
        </div>
        <div className="service-provider-secret-code__generate-btn m-l-xs">
          <ActionButton
            title={this.props.translate('Regenerate')}
            action={this.props.showSecretCodeRegenerateConfirm}
            className="btn btn-primary"
            icon={
              this.props.secretCode.generating
                ? 'fa fa-spinner fa-spin'
                : undefined
            }
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  secretCode: selectors.getServiceProviderSecretCode(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  showSecretCodeRegenerateConfirm: () =>
    dispatch(actions.showSecretCodeRegenerateConfirm(ownProps.serviceProvider)),
  getServiceProviderSecretCode: () =>
    dispatch(actions.secretCodeFetchStart(ownProps.serviceProvider)),
});

export const ServiceProviderSecretCode = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PureServiceProviderSecretCode);
