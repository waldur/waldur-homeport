import * as React from 'react';
import { connect } from 'react-redux';

import { fetchServiceUsageStart } from './actions';
import { FlowMapFilter } from './FlowMapFilter';
import SankeyDiagram from './SankeyDiagram';
import SankeyDiagramCalculator from './SankeyDiagramCalculator';
import { selectServiceUsage, propertySelectorFactory } from './selectors';

interface SankeyDiagramComponentProps {
  fetchServiceUsageStart: () => void;
  serviceUsage: any;
  data: any;
  organizationNames: any[];
  countryNames: any[];
}

class SankeyDiagramComponent extends React.Component<
  SankeyDiagramComponentProps
> {
  sankeyDiagramCalculator = new SankeyDiagramCalculator();

  componentDidMount() {
    this.props.fetchServiceUsageStart();
  }

  formatData() {
    if (this.props.serviceUsage.service_providers) {
      const providersToConsumerslinks = this.formatProvidersToConsumersLink();
      const countriesToProviderslinks = this.formatCountriesToProvidersLink();
      const data = this.props.organizationNames.concat(this.props.countryNames);
      const links = providersToConsumerslinks.concat(countriesToProviderslinks);
      return { data, links };
    }
  }

  formatProvidersToConsumersLink() {
    const links = [];
    Object.keys(this.props.serviceUsage.service_providers).forEach(
      providerUuid => {
        this.props.serviceUsage.service_providers[providerUuid].map(
          consumerUuid => {
            links.push({
              source: this.props.serviceUsage.organizations[consumerUuid].name,
              target: this.props.serviceUsage.organizations[providerUuid].name,
              value: this.sankeyDiagramCalculator.calculateValue(
                this.props.serviceUsage,
                providerUuid,
                consumerUuid,
              ),
            });
          },
        );
      },
    );
    return links;
  }

  formatCountriesToProvidersLink() {
    const links = [];
    Object.keys(this.props.serviceUsage.service_providers).forEach(
      providerUuid => {
        const provider = this.props.serviceUsage.organizations[providerUuid];
        links.push({
          source: provider.name,
          target: provider.country,
          value: this.sankeyDiagramCalculator.calculateValueForCountry(
            this.props.serviceUsage,
            providerUuid,
          ),
        });
      },
    );
    return links;
  }

  render() {
    const data = this.formatData();
    return (
      <>
        <FlowMapFilter />
        <SankeyDiagram data={data} {...this.props} />
      </>
    );
  }
}

const mapStateToProps = state => ({
  serviceUsage: selectServiceUsage(state),
  organizationNames: propertySelectorFactory('name')(state),
  countryNames: propertySelectorFactory('country')(state),
});

const matchDispatchToProps = dispatch => ({
  fetchServiceUsageStart: () => dispatch(fetchServiceUsageStart()),
});

export const SankeyDiagramContainer = connect(
  mapStateToProps,
  matchDispatchToProps,
)(SankeyDiagramComponent);
