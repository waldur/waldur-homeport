import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { getProvider, getProviderOfferings } from '@waldur/marketplace/common/api';
import { ProviderDetails } from '@waldur/marketplace/service-providers/ProviderDetails';
import { OfferingsListType } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { ProviderDataType } from './types';

interface ProviderDetailsContainerState {
  provider: ProviderDataType;
  providerOfferings: OfferingsListType;
}

class ProviderDetailsContainer extends React.Component<TranslateProps, ProviderDetailsContainerState> {
  constructor(props) {
    super(props);
    this.state = {
      provider: {
        data: {
          name: '',
          email: '',
        },
        loading: true,
        loaded: false,
      },
      providerOfferings: {
        items: [],
        loading: true,
        loaded: false,
      },
    };
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    try {
      const [provider, offerings] = await Promise.all(
        [
          getProvider($state.params.customer_uuid),
          getProviderOfferings($state.params.customer_uuid),
        ]
      );
      this.setState({
        provider: {
          data: provider,
          loading: false,
          loaded: true,
        },
        providerOfferings: {
          items: offerings,
          loading: false,
          loaded: true,
        },
      });
    } catch {
      this.setState({
        provider: {
          data: {
            name: '',
            email: '',
          },
          loading: false,
          loaded: false,
        },
        providerOfferings: {
          items: [],
          loading: false,
          loaded: false,
        },
      });
    }
  }

  render() {
    if (this.state.provider.loading) {
      return <LoadingSpinner/>;
    }

    if (!this.state.provider.loaded) {
      return (
        <h3 className="text-center">
          {this.props.translate('Unable to load service provider.')}
        </h3>
      );
    }

    return (
      <ProviderDetails
        provider={this.state.provider.data}
        providerOfferings={this.state.providerOfferings}
        translate={this.props.translate}
      />
    );
  }
}

export default connectAngularComponent(withTranslation(ProviderDetailsContainer));
