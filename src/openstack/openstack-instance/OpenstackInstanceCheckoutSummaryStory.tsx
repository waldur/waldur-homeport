import * as React from 'react';

import { OpenstackInstanceCheckoutSummary } from '@waldur/openstack/openstack-instance/OpenstackInstanceCheckoutSummary';
import { connectAngularComponent } from '@waldur/store/connect';

import { summaryData, flavor } from './storyFixtures';

export class OpenstackInstanceCheckoutSummaryStory extends React.Component {
  state = {
    withFlavor: false,
  };

  changeMode = () => {
    this.setState({withFlavor: !this.state.withFlavor});
  }

  render() {
    const dataWithFlavor = {...summaryData, formData: {...summaryData.formData, flavor}};
    const dataWithoutFlavor = summaryData;
    const data = this.state.withFlavor ? dataWithFlavor : dataWithoutFlavor;
    return (
      <>
        <strong>
          <button className="btn btn-success" onClick={this.changeMode}>
            {this.state.withFlavor ? 'Without Flavor' : 'With Flavor'}
          </button>
        </strong>
        <OpenstackInstanceCheckoutSummary {...data}/>
      </>
    );
  }
}

export default connectAngularComponent(OpenstackInstanceCheckoutSummaryStory);
