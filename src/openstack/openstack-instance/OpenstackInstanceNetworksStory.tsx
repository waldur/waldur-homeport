import * as React from 'react';

import { OpenstackInstanceNetworks } from '@waldur/openstack/openstack-instance/OpenstackInstanceNetworks';
import { subnets, floatingIps } from '@waldur/openstack/openstack-instance/storyFixtures';
import { connectAngularComponent } from '@waldur/store/connect';

export class OpenstackInstanceNetworksStory extends React.Component {
  state = {
    selectedValue: [],
  };

  selectValue = value => {
    this.setState({selectedValue: value});
  }

  render() {
    return (
      <>
      <strong>{`Selected value: ${JSON.stringify(this.state.selectedValue, null, 2)}`}</strong>
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

export default connectAngularComponent(OpenstackInstanceNetworksStory);
