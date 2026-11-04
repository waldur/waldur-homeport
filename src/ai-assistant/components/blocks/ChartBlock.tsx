import { FC, useMemo } from 'react';
import type { ChartSpec } from 'waldur-js-client';

import { UIBlockProps } from '@/ai-assistant/lib/types';
import { ChartSpecView } from '@/core/charts/ChartSpecView';

/** A chart from an insight tool, rendered from the spec fields on the block. */
export const ChartBlock: FC<UIBlockProps> = ({ block }) => {
  const spec = useMemo<ChartSpec | null>(
    () =>
      block.chart_type && block.series && block.x && block.y
        ? {
            chart_type: block.chart_type,
            title: block.title ?? '',
            subtitle: block.subtitle,
            x: block.x,
            y: block.y,
            y2: block.y2,
            series: block.series,
            annotations: block.annotations,
            link: block.link,
            empty_message: block.empty_message,
          }
        : null,
    [block],
  );
  if (!spec) return null;
  return (
    <div className="w-full rounded-lg border border-secondary bg-primary p-4 my-3">
      <ChartSpecView spec={spec} />
    </div>
  );
};
