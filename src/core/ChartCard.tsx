import { DownloadSimpleIcon } from '@phosphor-icons/react';
import React, { useCallback, useRef } from 'react';
import { Card, Dropdown } from 'react-bootstrap';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import exportAs from '@/table/exporters';
import { ExportData } from '@/table/exporters/types';

interface ChartCardProps {
  title: string;
  children: (ref: React.RefObject<any>) => React.ReactNode;
  getExportData?: () => ExportData;
  isEmpty?: boolean;
  actions?: React.ReactNode;
  showPNG?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  getExportData,
  isEmpty,
  actions,
  showPNG = true,
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
        </Card.Title>
        <div className="card-toolbar d-flex gap-4 m-0">
          {actions}
          <ActionsDropdownComponent
            labeled
            disabled={isEmpty}
            align="end"
            drop="down"
            className="btn-md"
            label={
              <>
                <span className="svg-icon svg-icon-2 me-1">
                  <DownloadSimpleIcon weight="bold" />
                </span>
                {translate('Export')}
              </>
            }
          >
            {showPNG && (
              <Dropdown.Item onClick={handleExportPNG}>
                {translate('Export as PNG')}
              </Dropdown.Item>
            )}
            {getExportData && (
              <>
                <Dropdown.Item onClick={() => handleExportData('csv')}>
                  {translate('Export as CSV')}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleExportData('excel')}>
                  {translate('Export as XLSX')}
                </Dropdown.Item>
              </>
            )}
          </ActionsDropdownComponent>
        </div>
      </Card.Header>
      <Card.Body className="pt-2">
        {isEmpty ? (
          <NoResult
            title={translate('No data available')}
            message={translate('Try adjusting your filters or date range.')}
            className="py-10"
            noAction
          />
        ) : (
          children(chartRef)
        )}
      </Card.Body>
    </Card>
  );
};
