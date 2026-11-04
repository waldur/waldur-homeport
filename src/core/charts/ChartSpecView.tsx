import { ArrowRightIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import type { ChartSpec } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { renderFieldOrDash } from '@/table/utils';

import {
  buildChartSpecOptions,
  chartSpecHasData,
  chartSpecHeight,
} from './chartSpecOptions';

interface ChartSpecViewProps {
  spec: ChartSpec;
  /** Hide the title when the surrounding card already shows it. */
  hideTitle?: boolean;
  /** Called with a point's id (e.g. a job ID) when it is clicked. */
  onPointClick?: (id: string) => void;
  height?: number;
}

/** Renders a backend chart spec: title, subtitle, chart or empty message, link. */
export const ChartSpecView: FC<ChartSpecViewProps> = ({
  spec,
  hideTitle,
  onPointClick,
  height,
}) => {
  const options = useMemo(() => buildChartSpecOptions(spec), [spec]);
  const hasData = chartSpecHasData(spec);
  const handleClick = useCallback(
    (params) => {
      const id = spec.series[params.seriesIndex]?.ids?.[params.dataIndex];
      if (id && onPointClick) onPointClick(id);
    },
    [spec, onPointClick],
  );

  return (
    <div className="flex flex-col gap-2 min-w-0">
      {!hideTitle && (
        <div>
          <div className="font-semibold">{spec.title}</div>
          {spec.subtitle && (
            <div className="text-tertiary text-xs">{spec.subtitle}</div>
          )}
        </div>
      )}
      {hideTitle && spec.subtitle && (
        <div className="text-tertiary text-xs">{spec.subtitle}</div>
      )}
      {hasData ? (
        <EChart
          options={options}
          height={`${height ?? chartSpecHeight(spec)}px`}
          onClick={onPointClick ? handleClick : undefined}
        />
      ) : (
        <div className="text-tertiary text-xs py-6 text-center">
          {renderFieldOrDash(spec.empty_message)}
        </div>
      )}
      {spec.link && (
        // The backend only emits same-site paths (chart_spec.ChartLinkSerializer).
        <a
          href={spec.link.url}
          className="flex items-center gap-1 text-xs font-medium text-brand self-start"
        >
          {spec.link.label}
          <ArrowRightIcon weight="bold" />
        </a>
      )}
    </div>
  );
};
