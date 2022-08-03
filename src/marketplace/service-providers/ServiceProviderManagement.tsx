import { Component } from 'react';
import { connect } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { ServiceProvider } from '@waldur/marketplace/types';
import { showError, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';
import { ActionButton } from '@waldur/table/ActionButton';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { SecretValueField } from '../SecretValueField';

import { canRegisterServiceProviderForCustomer } from './selectors';
import {
  secretCodeFetchStart,
  showSecretCodeRegenerateConfirm,
} from './store/actions';
import { getServiceProviderSecretCode } from './store/selectors';

interface ServiceProviderWrapperProps {
  customer: Customer;
  canRegisterServiceProvider: boolean;
  showError?(message: string): void;
  showSuccess?(message: string): void;
  updateCustomer(customer: Customer): void;
  secretCode: {
    code: string;
    generating: boolean;
  };
  getServiceProviderSecretCode(provider): void;
  showSecretCodeRegenerateConfirm(provider): void;
}

interface ServiceProviderWrapperState {
  registering: boolean;
  loading: boolean;
  serviceProvider: ServiceProvider;
}

const updateCustomer = (customer: Customer) =>
  setCurrentCustomer({
    ...customer,
    is_service_provider: true,
  });

class ServiceProviderWrapper extends Component<
  ServiceProviderWrapperProps,
  ServiceProviderWrapperState
> {
  state = {
    registering: false,
    loading: false,
    serviceProvider: null,
  };

  registerServiceProvider = async () => {
    const successMessage = translate('Service provider has been registered.');
    const errorMessage = translate('Unable to register service provider.');
    try {
      this.setState({ registering: true });
      const serviceProvider = await api.createServiceProvider({
        customer: this.props.customer.url,
      });
      this.setState({ registering: false, serviceProvider });
      this.props.showSuccess(successMessage);
      this.props.updateCustomer(this.props.customer);
    } catch (error) {
      this.setState({ registering: false });
      this.props.showError(errorMessage);
    }
  };

  async getServiceProvider() {
    const errorMessage = translate('Unable to load service provider.');
    try {
      this.setState({ loading: true });
      const serviceProvider = await api.getServiceProviderByCustomer({
        customer_uuid: this.props.customer.uuid,
      });
      this.setState({ loading: false, serviceProvider });
      if (serviceProvider) {
        this.props.getServiceProviderSecretCode(serviceProvider);
      }
    } catch (error) {
      this.setState({ loading: false });
      this.props.showError(errorMessage);
    }
  }

  componentDidMount() {
    this.getServiceProvider();
  }

  render() {
    if (!this.props.customer) {
      return null;
    } else if (this.state.loading) {
      return <LoadingSpinner />;
    } else if (this.state.serviceProvider) {
      return (
        <div className="d-flex justify-content-between">
          <div>
            <p>
              {`${translate('Registered at:')} ${formatDateTime(
                this.state.serviceProvider.created,
              )}`}
            </p>
            <p>
              {translate('API secret code:')}
              <SecretValueField value={this.props.secretCode.code} />
            </p>
          </div>
          <div>
            <ActionButton
              title={translate('Regenerate')}
              action={() =>
                this.props.showSecretCodeRegenerateConfirm(
                  this.state.serviceProvider,
                )
              }
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
    } else if (this.props.canRegisterServiceProvider) {
      return (
        <div className="d-flex justify-content-between">
          <p>
            {translate(
              'You can register organization as a service provider by pressing the button',
            )}
          </p>
          <div>
            <ActionButton
              title={translate('Register as service provider')}
              action={this.registerServiceProvider}
              className="btn btn-primary"
              icon={
                this.state.registering ? 'fa fa-spinner fa-spin' : undefined
              }
            />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  canRegisterServiceProvider: canRegisterServiceProviderForCustomer(state),
  secretCode: getServiceProviderSecretCode(state),
});

const mapDispatchToProps = (dispatch) => ({
  showSecretCodeRegenerateConfirm: (serviceProvider) =>
    dispatch(showSecretCodeRegenerateConfirm(serviceProvider)),
  getServiceProviderSecretCode: (serviceProvider) =>
    dispatch(secretCodeFetchStart(serviceProvider)),
  showError: (message) => dispatch(showError(message)),
  showSuccess: (message) => dispatch(showSuccess(message)),
  updateCustomer: (customer) => dispatch(updateCustomer(customer)),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ServiceProviderManagement = enhance(ServiceProviderWrapper);
