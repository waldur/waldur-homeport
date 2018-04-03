import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $filter } from '@waldur/core/services';
import { formatFilesize } from '@waldur/core/utils';
import { connectAngularComponent } from '@waldur/store/connect';

import { loadData } from './api';
import { QuotaSelector } from './QuotaSelector';
import { TreemapChart } from './TreemapChart';
import { QuotaList } from './types';

class TreemapContainer extends React.Component {
  state = {
    loading: true,
    loaded: false,
    quotasMap: undefined,
    selectedQuota: undefined,
  };

  quotas: QuotaList = [
    {
      key: 'nc_ram_usage',
      title: 'RAM, GB',
      tooltipValueFormatter: formatFilesize,
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
    {
      key: 'current_price',
      title: 'Price per month',
      tooltipValueFormatter: value => $filter('defaultCurrency')(value),
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
      const quota = this.quotas.find(item => item.key === this.state.selectedQuota);
      let tooltipValueFormatter;
      if (quota) {
        tooltipValueFormatter = quota.tooltipValueFormatter;
      }
      const chartData = this.state.quotasMap[this.state.selectedQuota];

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
            data={chartData}
            tooltipValueFormatter={tooltipValueFormatter}
          />
        </>
      );
    }
  }
}

export default connectAngularComponent(TreemapContainer);
