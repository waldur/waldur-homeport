import { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { Customer } from '@waldur/customer/types';
import { withTranslation, TranslateProps, translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { ServiceProvider } from '@waldur/marketplace/types';
import { showError, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import { canRegisterServiceProviderForCustomer } from './selectors';
import { ServiceProviderRegisterButton } from './ServiceProviderRegisterButton';
import { ServiceProviderSecretCode } from './ServiceProviderSecretCode';

interface ServiceProviderWrapperProps extends TranslateProps {
  customer: Customer;
  canRegisterServiceProvider: boolean;
  showError?(message: string): void;
  showSuccess?(message: string): void;
  updateCustomer(customer: Customer): void;
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
    } catch (error) {
      this.setState({ loading: false });
      this.props.showError(errorMessage);
    }
  }

  componentDidMount() {
    this.getServiceProvider();
  }

  render() {
    return (
      <>
        <ServiceProviderRegisterButton
          registerServiceProvider={this.registerServiceProvider}
          {...this.props}
          {...this.state}
        />
        {this.props.customer && this.props.customer.is_service_provider && (
          <>
            <br />
            <ServiceProviderSecretCode
              serviceProvider={this.state.serviceProvider}
              showError={this.props.showError}
              showSuccess={this.props.showSuccess}
              translate={translate}
            />
          </>
        )}
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  canRegisterServiceProvider: canRegisterServiceProviderForCustomer(state),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, {
    showError,
    showSuccess,
    updateCustomer,
  }),
);

export const ServiceProviderManagement = enhance(ServiceProviderWrapper);
