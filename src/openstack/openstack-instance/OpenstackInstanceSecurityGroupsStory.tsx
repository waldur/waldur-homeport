import * as React from 'react';

import { OpenstackInstanceSecurityGroups } from '@waldur/openstack/openstack-instance/OpenstackInstanceSecurityGroups';
import { connectAngularComponent } from '@waldur/store/connect';

import { SecurityGroup } from '../openstack-security-groups/types';

import { securityGroups } from './storyFixtures';

export class OpenstackInstanceSecurityGroupsStory extends React.Component {
  state = {
    selectedSecurityGroups: [],
  };

  setSelectedSecurityGroups = (values) => {
    this.setState({ selectedSecurityGroups: values });
  };

  render() {
    return (
      <OpenstackInstanceSecurityGroups
        input={{
          value: this.state.selectedSecurityGroups,
          onChange: this.setSelectedSecurityGroups,
        }}
        securityGroups={securityGroups as SecurityGroup[]}
      />
    );
  }
}

export default connectAngularComponent(OpenstackInstanceSecurityGroupsStory);
