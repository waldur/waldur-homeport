import * as React from 'react';
import { compose } from 'redux';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { formatServiceProviders } from '@waldur/analytics/utils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { withTranslation, TranslateProps } from '@waldur/i18n';

import * as api from './api';
import { VmOverviewFilter } from './VmOverviewFilter';

class VmOverviewFilterComponent extends React.Component<InjectedFormProps&TranslateProps> {
  state = {
    loaded: false,
    erred: false,
    serviceProviders: [],
  };

  componentDidMount() {
    api.loadServiceProviders().then(serviceProviders => {
      const formatedServiceProviders = formatServiceProviders(serviceProviders);
      this.setState({
        serviceProviders: formatedServiceProviders,
        loaded: true,
        erred: false,
      });
    })
    .catch(() => {
      this.setState({
        loaded: false,
        erred: true,
      });
    });
  }

  render() {
    if (this.state.erred) {
      return (
        <h3 className="text-center">
          {this.props.translate('Unable to load service providers.')}
        </h3>
      );
    }
    if (!this.state.loaded) {
      return <LoadingSpinner/>;
    }
    return <VmOverviewFilter {...this.props} serviceProviders={this.state.serviceProviders}/>;
  }
}

const enhance = compose(
  reduxForm({
    form: 'vmOverviewFilter',
    initialValues: {shared: true},
  }),
  withTranslation,
);

export const VmOverviewFilterContainer = enhance(VmOverviewFilterComponent);
