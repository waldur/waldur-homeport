import * as React from 'react';
import { ReactNode } from 'react';

import loadEcharts from '../../../shims/load-echarts';

interface SankeyDiagramProps {
  data: any;
}

export default class SankeyDiagram extends React.Component<SankeyDiagramProps> {
  container: ReactNode;
  diagram = undefined;

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

  renderDiagram() {
    const options = this.getChartsOptions();
    this.diagram.setOption(options);
  }

  drawDiagram() {
    loadEcharts().then(module => {
      const echarts = module.default;
      const diagram = echarts.getInstanceByDom(this.container);
      if (!diagram) {
        this.diagram = echarts.init(this.container, );
      }
      this.renderDiagram();
    });
  }

  componentDidMount() {
    this.drawDiagram();
  }

  componentWillUnmount() {
    this.diagram.dispose();
  }

  render() {
    return (
      <div id="sankey-diagram" ref={container => this.container = container} />
    );
  }
}
