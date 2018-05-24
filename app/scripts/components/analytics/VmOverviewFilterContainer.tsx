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
    serviceProviders: [],
  };

  componentDidMount() {
    api.loadServiceProviders().then(serviceProviders => {
      const formatedServiceProviders = formatServiceProviders(serviceProviders);
      this.setState({serviceProviders: formatedServiceProviders});
    });
  }

  render() {
    if (this.state.serviceProviders.length === 0) {
      return <LoadingSpinner />;
    }
    return <VmOverviewFilter {...this.props} serviceProviders={this.state.serviceProviders}/>;
  }
}

const enhance = compose(
  withTranslation,
  reduxForm({
    form: 'vmOverviewFilter',
    initialValues: {shared: true},
  }),
);

export const VmOverviewFilterContainer = enhance(VmOverviewFilterComponent);
