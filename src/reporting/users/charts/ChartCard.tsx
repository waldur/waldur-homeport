import { DownloadSimpleIcon } from '@phosphor-icons/react';
import React, { useCallback, useRef } from 'react';
import { Card, Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { ActionDropdownButton } from '@waldur/table/ActionDropdownButton';
import exportAs from '@waldur/table/exporters';
import { ExportData } from '@waldur/table/exporters/types';

interface ChartCardProps {
  title: string;
  children: (ref: React.RefObject<any>) => React.ReactNode;
  getExportData?: () => ExportData;
  isEmpty?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  getExportData,
  isEmpty,
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
      <Card.Header className="align-items-center border-0 pt-5">
        <Card.Title className="align-items-start flex-column">
          <span className="card-label fw-bold text-gray-900">{title}</span>
        </Card.Title>
        <div className="card-toolbar">
          <ActionDropdownButton
            disabled={isEmpty}
            className="dropdown-btn"
            title={
              <>
                <DownloadSimpleIcon size={18} weight="bold" className="me-2" />
                {translate('Export')}
              </>
            }
            id={`chart-export-${title.replace(/\s+/g, '-').toLowerCase()}`}
            align="end"
          >
            <Dropdown.Item onClick={handleExportPNG}>
              {translate('Export as PNG')}
            </Dropdown.Item>
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
          </ActionDropdownButton>
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
