import * as React from 'react';
import { ReactNode } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import loadEcharts from '@waldur/shims/load-echarts';

import './SankeyDiagram.scss';

interface SankeyDiagramProps {
  data: any;
}

interface SankeyDiagramState {
  loading: boolean;
}

export default class SankeyDiagram extends React.Component<SankeyDiagramProps, SankeyDiagramState> {
  container: ReactNode;
  chart = undefined;

  state = {loading: true};

  getChartsOptions() {
    return {
      series: {
        type: 'sankey',
        layout: 'none',
        data: this.props.data.data,
        links: this.props.data.links,
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        },
    };
  }

  renderChart() {
    const options = this.getChartsOptions();
    this.chart.setOption(options);
  }

  drawChart = () => {
    loadEcharts().then(module => {
      const echarts = module.default;
      let chart;
      if (this.container) {
        chart = echarts.getInstanceByDom(this.container);
      }
      if (!chart && this.container) {
        this.chart = echarts.init(this.container);
        this.renderChart();
      }
    });
  }

  componentDidUpdate() {
    this.drawChart();
  }

  componentDidMount() {
    this.drawChart();
    this.setState({loading: false});
    this.forceUpdate();
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner />;
    }
    return (
      <div id="sankey-diagram" ref={container => this.container = container} />
    );
  }
}
