import React, { useCallback, useRef } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import exportAs from '@/table/exporters';
import { ExportData } from '@/table/exporters/types';

import { ChartExportDropdown } from './ChartExportDropdown';

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
    if (chartRef.current) {
      const url = chartRef.current.getDataURL({
        pixelRatio: 2,
        backgroundColor: '#fff',
        type: 'png',
      });
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.png`;
      link.click();
    }
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
    <Card className="h-100 card-bordered">
      <Card.Header className="align-items-center border-0 pt-5 pb-2 min-h-60px">
        <Card.Title className="align-items-start flex-column m-0">
          <span className="card-label fw-bold text-gray-900">{title}</span>
          {summary && (
            <span className="text-tertiary fs-7 fw-normal">{summary}</span>
          )}
        </Card.Title>
        <div className="card-toolbar d-flex gap-4 m-0">
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
      </Card.Header>
      <Card.Body className="pt-2">
        {isEmpty ? (
          <NoResult
            // Filter-agnostic: this card is used on unfiltered overviews too,
            // so the copy must not point at controls that may not be on screen.
            title={translate('No data to display')}
            message={translate(
              'This chart will populate once data is available.',
            )}
            className="d-flex flex-column justify-content-center"
            style={chartHeight ? { minHeight: chartHeight } : undefined}
            noAction
          />
        ) : (
          children(chartRef)
        )}
      </Card.Body>
    </Card>
  );
};
