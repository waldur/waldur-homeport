import { useEffect, useRef } from 'react';

export interface ChartCanvasProps {
  options: any;
  /** A CSS height, such as "280px". */
  height: string;
  /** 'light' or 'dark': which registered theme the chart draws with. */
  theme: string;
  /** Called with ECharts' event params when a chart element is clicked. */
  onClick?: (params: any) => void;
}

/**
 * An ECharts chart and nothing else: no export menu, no portal state. It
 * loads ECharts on first use, follows its container's size and redraws
 * with the other theme when `theme` changes. The portal's own EChart adds
 * export actions on top of the same library.
 */
export const EChartCanvas = ({
  options,
  height,
  theme,
  onClick,
}: ChartCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  // One instance per theme: ECharts takes the theme at init.
  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    import('./echarts').then(({ default: echarts }) => {
      if (disposed || !containerRef.current) return;
      const chart = echarts.init(containerRef.current, `${theme}-metronic`);
      chart.on('click', (params) => onClickRef.current?.(params));
      chartRef.current = chart;
      chart.setOption(options);
      observer = new ResizeObserver(() => chart.resize());
      observer.observe(containerRef.current);
    });
    return () => {
      disposed = true;
      observer?.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
    // Options are applied by the effect below; a theme change re-creates.
  }, [theme]);

  useEffect(() => {
    chartRef.current?.setOption(options, true);
  }, [options]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[var(--chart-height)]"
      style={{ '--chart-height': height } as React.CSSProperties}
    />
  );
};
