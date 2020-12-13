import { Component } from 'react';

import { OpenstackInstanceNetworks } from '@waldur/openstack/openstack-instance/OpenstackInstanceNetworks';
import {
  subnets,
  floatingIps,
} from '@waldur/openstack/openstack-instance/storyFixtures';

export class OpenstackInstanceNetworksStory extends Component {
  state = {
    selectedValue: [],
  };

  selectValue = (value) => {
    this.setState({ selectedValue: value });
  };

  render() {
    return (
      <>
        <strong>{`Selected value: ${JSON.stringify(
          this.state.selectedValue,
          null,
          2,
        )}`}</strong>
        <OpenstackInstanceNetworks
          input={{
            onChange: this.selectValue,
            value: this.state.selectedValue,
          }}
          subnets={subnets}
          floatingIps={floatingIps}
        />
      </>
    );
  }
}
