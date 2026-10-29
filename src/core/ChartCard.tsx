import React, { useCallback, useRef } from 'react';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import exportAs from '@/table/exporters';
import { ExportData } from '@/table/exporters/types';

import { ChartExportDropdown } from './ChartExportDropdown';
import { saveChartPng } from './chartPng';

interface ChartCardProps {
  title: string;
  children: (ref: React.RefObject<any>) => React.ReactNode;
  getExportData?: () => ExportData;
  isEmpty?: boolean;
  actions?: React.ReactNode;
  showPNG?: boolean;
  /** Totals for the plotted metric, shown under the title. */
  summary?: React.ReactNode;
  /** Height of the wrapped chart, held by the empty state so it can't collapse. */
  chartHeight?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  getExportData,
  isEmpty,
  actions,
  showPNG = true,
  summary,
  chartHeight,
}) => {
  const chartRef = useRef<any>(null);

  const handleExportPNG = useCallback(() => {
    if (chartRef.current) saveChartPng(chartRef.current, title);
  }, [title]);

  const handleExportData = useCallback(
    async (format: 'csv' | 'excel') => {
      if (!getExportData) return;
      const data = getExportData();
      await exportAs(format, title, data);
    },
    [getExportData, title],
  );

  return (
    <div className="card h-full card-bordered">
      <div className="card-header items-center border-0 pt-4 pb-1.5 min-h-[60px]">
        <div className="card-title items-start flex-col m-0">
          <span className="card-label font-medium text-primary">{title}</span>
          {summary && (
            <span className="text-quaternary text-xs font-normal">
              {summary}
            </span>
          )}
        </div>
        <div className="card-toolbar flex gap-3 m-0">
          {actions}
          <ChartExportDropdown
            disabled={isEmpty}
            size="md"
            onExportPng={showPNG ? handleExportPNG : undefined}
            onExportCsv={
              getExportData ? () => handleExportData('csv') : undefined
            }
            onExportExcel={
              getExportData ? () => handleExportData('excel') : undefined
            }
          />
        </div>
      </div>
      <div className="card-body pt-1.5">
        {isEmpty ? (
          <NoResult
            // Filter-agnostic: this card is used on unfiltered overviews too,
            // so the copy must not point at controls that may not be on screen.
            title={translate('No data to display')}
            message={translate(
              'This chart will populate once data is available.',
            )}
            className="flex flex-col justify-center"
            style={chartHeight ? { minHeight: chartHeight } : undefined}
            noAction
          />
        ) : (
          children(chartRef)
        )}
      </div>
    </div>
  );
};
