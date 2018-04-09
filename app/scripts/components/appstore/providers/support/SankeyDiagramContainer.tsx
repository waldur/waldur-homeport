import * as React from 'react';

import { connect } from 'react-redux';

import { FlowMapFilter } from '@waldur/appstore/providers/support/FlowMapFilter';
import { serviceUsageSelector } from '@waldur/appstore/providers/support/selectors';
import { connectAngularComponent } from '@waldur/store/connect';

import { fetchServiceUsageStart } from './actions';
import SankeyDiagram from './SankeyDiagram';

interface SankeyDiagramComponentProps {
  fetchServiceUsageStart: () => void;
  serviceUsage: any;
  data: any;
}

class SankeyDiagramComponent extends React.Component<SankeyDiagramComponentProps> {
  componentWillMount() {
    this.props.fetchServiceUsageStart();
  }

  formatData() {
    if (this.props.serviceUsage.service_providers) {
      const organizationsNames = this.getOrganizationsNames();
      const countriesNames = this.getCountriesNames();
      const providersToConsumerslinks = this.formatProvidersToConsumersLink();
      const countriesToProviderslinks = this.formatCountriesToProvidersLink();
      const data = organizationsNames.concat(countriesNames);
      const links = providersToConsumerslinks.concat(countriesToProviderslinks);
      return {data, links};
    }
  }

  getOrganizationsNames() {
    const names = [];
    const namesObjects = [];
    Object.keys(this.props.serviceUsage.service_providers).map(providerUuid => {
      const providerName = this.props.serviceUsage.organizations[providerUuid].name;
      if (names.indexOf(providerName) === -1) {
        namesObjects.push({
          name: this.props.serviceUsage.organizations[providerUuid].name,
        });
        names.push(providerName);
      }
      this.props.serviceUsage.service_providers[providerUuid].map(consumerUuid => {
        const consumerName = this.props.serviceUsage.organizations[consumerUuid].name;
        if (names.indexOf(consumerName) === -1) {
          namesObjects.push({
            name: consumerName,
          });
          names.push(consumerName);
        }
      });
    });
    return namesObjects;
  }

  getCountriesNames() {
    const names = [];
    const namesObjects = [];
    Object.keys(this.props.serviceUsage.service_providers).map(providerUuid => {
      const providerCountry = this.props.serviceUsage.organizations[providerUuid].country;
      if (names.indexOf(providerCountry) === -1) {
        namesObjects.push({
          name: providerCountry,
        });
        names.push(providerCountry);
      }
      this.props.serviceUsage.service_providers[providerUuid].map(consumerUuid => {
        const consumerCountry = this.props.serviceUsage.organizations[consumerUuid].country;
        if (names.indexOf(consumerCountry) === -1) {
          namesObjects.push({
            name: consumerCountry,
          });
          names.push(consumerCountry);
        }
      });
    });
    return namesObjects;
  }

  getResourcesSum(usage, providerUuid) {
    return usage.reduce((total, entry) => {
      if (entry.provider_to_consumer.provider_uuid === providerUuid) {
        total += entry.data.cpu;
      }
      return total;
    }, 0);
  }

  calculateValue(usage, providerUuid, consumerUuid) {
    const totalProviderResources = this.getResourcesSum(usage, providerUuid);
    const providerResources = usage.reduce((value, entry) => {
      if (entry.provider_to_consumer.provider_uuid === providerUuid &&
        entry.provider_to_consumer.consumer_uuid === consumerUuid) {
        value += entry.data.cpu;
      }
      return value;
    }, 0);
    return Math.round(providerResources * 10 / totalProviderResources);
  }

  getResourcesSumForCountry(usage, countryName) {
    return usage.reduce((total, entry) => {
      const country = this.props.serviceUsage.organizations[entry.provider_to_consumer.provider_uuid].country;
      if (countryName === country) {
        total += entry.data.cpu;
      }
      return total;
    }, 0);
  }

  calculateValueForCountry(usage, providerUuid) {
    const country = this.props.serviceUsage.organizations[providerUuid].country;
    const totalProviderResourcesForCountry = this.getResourcesSumForCountry(usage, country);
    const providerResources = usage.reduce((value, entry) => {
      if (entry.provider_to_consumer.provider_uuid === providerUuid) {
        value += entry.data.cpu;
      }
      return value;
    }, 0);
    return Math.round(providerResources * 10 / totalProviderResourcesForCountry);
  }

  formatProvidersToConsumersLink() {
    const links = [];
    Object.keys(this.props.serviceUsage.service_providers).map(providerUuid => {
      this.props.serviceUsage.service_providers[providerUuid].map(consumerUuid => {
        links.push({
          source: this.props.serviceUsage.organizations[consumerUuid].name,
          target: this.props.serviceUsage.organizations[providerUuid].name,
          value: this.calculateValue(this.props.serviceUsage.usage, providerUuid, consumerUuid),
        });
      });
    });
    return links;
  }

  formatCountriesToProvidersLink() {
    const links = [];
    Object.keys(this.props.serviceUsage.service_providers).map(providerUuid => {
      const provider = this.props.serviceUsage.organizations[providerUuid];
      links.push({
        source: provider.name,
        target: provider.country,
        value: this.calculateValueForCountry(this.props.serviceUsage.usage, providerUuid),
      });
    });
    return links;
  }

  render() {
    const data = this.formatData();
    return (
      <>
        <FlowMapFilter />
        <SankeyDiagram data={data} {...this.props}/>
      </>
    );
  }
}

const mapStateToProps = state => ({
  serviceUsage: serviceUsageSelector(state),
});

const matchDispatchToProps = dispatch => ({
  fetchServiceUsageStart: () => dispatch(fetchServiceUsageStart()),
});

const SankeyDiagramContainer = connect(mapStateToProps, matchDispatchToProps)(SankeyDiagramComponent);

export default connectAngularComponent(SankeyDiagramContainer);
