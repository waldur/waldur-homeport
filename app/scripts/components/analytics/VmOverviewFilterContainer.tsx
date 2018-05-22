import * as React from 'react';

import * as api from './api';
import { VmOverviewFilter } from './VmOverviewFilter';

export default class VmOverviewComponent extends React.Component {
  state = {
    serviceProviders: [],
  };

  componentDidMount() {
    api.loadServiceProviders().then(serviceProviders => this.setState({serviceProviders}));
  }

  render() {
    return (
      <VmOverviewFilter serviceProviders={this.state.serviceProviders}/>
    );
  }
}
