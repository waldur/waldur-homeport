import echarts from 'echarts';
import * as React from 'react';

import { levelOptions } from './styles';
import { TreemapData } from './types';

const formatUtil = echarts.format;

interface TreemapChartProps {
  height: number | string;
  width: number | string;
  title: string;
  theme?: string;
  data: TreemapData;
}

export class TreemapChart extends React.Component<TreemapChartProps> {
  container = undefined;
  chart = undefined;

  componentDidMount() {
    this.drawChart();
  }

  componentWillUnmount() {
    this.chart.dispose();
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props;
    if (data !== prevProps.data) {
      this.renderChart();
    }
  }

  drawChart() {
    const chart = echarts.getInstanceByDom(this.container);
    if (!chart) {
      this.chart = echarts.init(this.container);
    }

    this.renderChart();
  }

  renderChart() {
    const options = this.getChartsOptions();
    this.chart.setOption(options, this.props.theme);
  }

  getChartsOptions() {
    return {
      title: {
        text: this.props.title,
        left: 'center',
      },

      tooltip: {
        formatter: info => {
          const treePathInfo = info.treePathInfo;
          const treePath = [];

          for (let i = 1; i < treePathInfo.length; i++) {
            treePath.push(treePathInfo[i].name);
          }

          const path = formatUtil.encodeHTML(treePath.join('/'));
          const value = formatUtil.addCommas(info.value);
          return `<div class="tooltip-title">${path}</div> ${this.props.title}: ${value} resources`;
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
    const style = {width, height};
    return <div style={style} ref={container => this.container = container}/>;
  }
}
