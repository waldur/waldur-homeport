import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { useTheme } from '@/theme/useTheme';

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

export const EChart = React.forwardRef<any, ChartProps>(
  ({ width = '100%', height = '100%', options, className, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<any>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    React.useImperativeHandle(ref, () => chartRef.current);

    useEffect(() => {
      drawChart();

      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
          resizeObserverRef.current = null;
        }
        if (chartRef.current) {
          chartRef.current.dispose();
          chartRef.current = null;
          containerRef.current = null;
        }
      };
    }, []);

    // Update chart with new theme
    useEffect(() => {
      if (!containerRef.current) return;

      import('@/echarts').then((module) => {
        if (!containerRef.current) return;
        const echarts = module.default;

        if (chartRef.current) {
          chartRef.current.dispose();
          chartRef.current = echarts.init(
            containerRef.current,
            `${theme}-metronic`,
          );
          renderChart();
        } else {
          drawChart();
        }
      });
    }, [theme]);

    useEffect(() => {
      if (chartRef.current) {
        renderChart();
      } else if (!chartRef.current && !loading) {
        drawChart();
      }
    }, [options, loading]);

    const drawChart = () => {
      setLoading(true);
      import('@/echarts').then((module) => {
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
        if (!resizeObserverRef.current) {
          resizeObserverRef.current = new ResizeObserver((entries) => {
            entries.forEach(({ target }) => {
              const instance = echarts.getInstanceByDom(target as HTMLElement);
              if (instance) {
                instance.resize();
              }
            });
          });
        }
        resizeObserverRef.current.observe(containerRef.current);
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
  },
);
