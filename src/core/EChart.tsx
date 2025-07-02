import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useTheme } from '@waldur/theme/useTheme';

import { EChartActions } from './EChartActions';

interface ChartProps {
  width?: string;
  height?: string;
  options: any;
  className?: string;
  exportPdf?: boolean;
  exportCsv?: boolean;
  exportExcel?: boolean;
  exportTitle?: string;
}

export const EChart: React.FC<ChartProps> = ({
  width = '100%',
  height = '100%',
  options,
  className,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    drawChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
        containerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      renderChart();
    } else if (!chartRef.current && !loading) {
      drawChart();
    }
  }, [options, theme, loading]);

  const drawChart = () => {
    setLoading(true);
    import('@waldur/echarts').then((module) => {
      setLoading(false);
      if (!containerRef.current) {
        return;
      }
      const echarts = module.default;
      const chart = echarts.getInstanceByDom(containerRef.current);
      if (!chart) {
        chartRef.current = echarts.init(
          containerRef.current,
          `${theme}-metronic`,
        );
      }
      renderChart();
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(({ target }) => {
          const instance = echarts.getInstanceByDom(target as HTMLElement);
          if (instance) {
            instance.resize();
          }
        });
      });
      resizeObserver.observe(containerRef.current);
    });
  };

  const renderChart = () => {
    if (chartRef.current) {
      chartRef.current.setOption(options, `${theme}-metronic`);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartRef.current]);

  const style = { width, height };

  return (
    <div
      className={classNames('content-center-center', className)}
      style={style}
    >
      {loading && <LoadingSpinner />}
      <EChartActions chartInstance={chartRef.current} {...props} />
      <div
        className={classNames({ hidden: loading })}
        style={style}
        ref={containerRef}
      />
    </div>
  );
};
