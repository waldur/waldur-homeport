import * as classNames from 'classnames';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import loadEcharts from '@waldur/shims/load-echarts';

interface ChartProps {
  width?: string;
  height?: string;
  theme?: any;
  options: any;
}

export class EChart extends React.Component<ChartProps> {
  container = undefined;
  chart = undefined;

  state = {
    loading: false,
  };

  static defaultProps = {
    width: '100%',
    height: '100%',
  };

  componentDidMount() {
    this.drawChart();
  }

  componentWillUnmount() {
    if (!this.chart) { return; }
    this.chart.dispose();
    this.container = null;
  }

  componentDidUpdate(prevProps) {
    const { options } = this.props;
    if (options === prevProps.options) { return; }
    if (this.chart) {
      this.renderChart();
    } else if (!this.chart && !this.state.loading) {
      this.drawChart();
    }
  }

  drawChart() {
    this.setState({
      loading: true,
    });
    loadEcharts().then(module => {
      this.setState({
        loading: false,
      });
      if (!this.container) { return; }
      const echarts = module.default;
      const chart = echarts.getInstanceByDom(this.container);
      if (!chart) {
        this.chart = echarts.init(this.container);
      }
      this.renderChart();
    });
  }

  renderChart() {
    this.chart.setOption(this.props.options, this.props.theme);
  }
  render() {
    const { width, height } = this.props;
    const { loading } = this.state;
    const style = { width, height };
    return (
      <div
        className="content-center-center"
        style={style}
      >
        {loading && <LoadingSpinner />}
        <div
          className={classNames({ hidden: loading })}
          style={style}
          ref={container => this.container = container}
        />
      </div>
    );
  }
}
