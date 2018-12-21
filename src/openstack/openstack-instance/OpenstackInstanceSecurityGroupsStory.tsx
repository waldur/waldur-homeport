import * as React from 'react';
import { Option, OptionValues } from 'react-select';

import { OpenstackInstanceSecurityGroups } from '@waldur/openstack/openstack-instance/OpenstackInstanceSecurityGroups';
import { connectAngularComponent } from '@waldur/store/connect';

import { securityGroups } from './storyFixtures';

export class OpenstackInstanceSecurityGroupsStory extends React.Component {
  state = {
    selectedSecurityGroups: [],
  };

  setSelectedSecurityGroups = (values: Array<Option<OptionValues>>) => {
    this.setState({selectedSecurityGroups: values});
  }

  render() {
    return (
      <OpenstackInstanceSecurityGroups
        input={{
          value: this.state.selectedSecurityGroups,
          onChange: this.setSelectedSecurityGroups,
        }}
        securityGroups={securityGroups}/>
      );
  }
}

export default connectAngularComponent(OpenstackInstanceSecurityGroupsStory);
