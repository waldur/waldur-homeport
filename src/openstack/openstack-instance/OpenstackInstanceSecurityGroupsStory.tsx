import * as React from 'react';
import { Option, OptionValues } from 'react-select';

import { translate } from '@waldur/i18n';
import { OpenstackInstanceSecurityGroupsContainer } from '@waldur/openstack/openstack-instance/OpenstackInstanceSecurityGroups';
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
      <OpenstackInstanceSecurityGroupsContainer
        translate={translate}
        input={{
          values: this.state.selectedSecurityGroups,
          onChange: this.setSelectedSecurityGroups,
        }}
        securityGroups={securityGroups}/>
      );
  }
}

export default connectAngularComponent(OpenstackInstanceSecurityGroupsStory);
