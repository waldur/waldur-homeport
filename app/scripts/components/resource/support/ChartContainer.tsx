import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { connectAngularComponent } from '@waldur/store/connect';

import { loadData } from './api';
import { QuotaSelector } from './QuotaSelector';
import { TreemapChart } from './TreemapChart';

class TreemapContainer extends React.Component {
  state = {
    loading: true,
    loaded: false,
    quotasMap: undefined,
    selectedQuota: undefined,
  };

  quotas = [
    {
      key: 'nc_ram_usage',
      title: 'RAM, GB',
    },
    {
      key: 'nc_cpu_usage',
      title: 'vCPU, cores',
    },
    {
      key: 'nc_resource_count',
      title: 'Resources',
    },
    {
      key: 'nc_volume_count',
      title: 'Volumes count',
    },
  ];

  componentDidMount() {
    const keys = this.quotas.map(quota => quota.key);
    const selectedQuota = 'nc_resource_count';
    loadData(keys).then(quotasMap => {
      this.setState({
        selectedQuota,
        quotasMap,
        loading: false,
        loaded: true,
      });
    });
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner/>;
    }
    if (this.state.loaded) {
      return (
        <>
          <QuotaSelector
            quotas={this.quotas}
            value={this.state.selectedQuota}
            handleChange={value => {
              this.setState({ selectedQuota: value });
            }}
          />
          <TreemapChart
            title="Resource usage"
            width="100%"
            height={500}
            data={this.state.quotasMap[this.state.selectedQuota]}
          />
        </>
      );
    }
  }
}

export default connectAngularComponent(TreemapContainer);
