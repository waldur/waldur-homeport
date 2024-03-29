import { Component } from 'react';

import { translate } from '@waldur/i18n';
import loadEcharts from '@waldur/shims/load-echarts';

import { levelOptions } from './styles';
import { TreemapData } from './types';

interface TreemapChartProps {
  height: number | string;
  width: number | string;
  title: string;
  theme?: string;
  data: TreemapData;
  tooltipValueFormatter?(value: number): string;
}

export class TreemapChart extends Component<TreemapChartProps> {
  container = undefined;
  chart = undefined;

  static defaultProps = {
    tooltipValueFormatter: (count) => translate('{count} resources', { count }),
  };

  componentDidMount() {
    this.drawChart();
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props;
    if (data !== prevProps.data) {
      this.renderChart();
    }
  }

  drawChart() {
    loadEcharts().then((module) => {
      const echarts = module.default;
      const chart = echarts.getInstanceByDom(this.container);
      if (!chart) {
        this.chart = echarts.init(this.container);
      }
      this.renderChart();
    });
  }

  renderChart() {
    if (this.chart) {
      const options = this.getChartsOptions();
      this.chart.setOption(options, this.props.theme);
    }
  }

  getChartsOptions() {
    return {
      title: {
        text: this.props.title,
        left: 'center',
      },

      tooltip: {
        formatter: (info) => {
          const treePath = info.treePathInfo.map((part) => part.name);
          const path = treePath.join('/');
          const value = this.props.tooltipValueFormatter(info.value);
          return `<div class="tooltip-title">${path}</div>${value}`;
        },
      },

      series: [
        {
          name: this.props.title,
          type: 'treemap',
          visibleMin: 300,
          label: {
            show: true,
            formatter: '{b}',
          },
          upperLabel: {
            normal: {
              show: true,
              height: 30,
            },
          },
          itemStyle: {
            normal: {
              borderColor: '#fff',
            },
          },
          levels: levelOptions,
          data: this.props.data,
        },
      ],
    };
  }

  render() {
    const { width, height } = this.props;
    const style = { width, height };
    return (
      <>
        <div style={style} ref={(container) => (this.container = container)} />
      </>
    );
  }
}
