import { FC, useCallback } from 'react';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import exportAs from '@/table/exporters';
import { ExportData } from '@/table/exporters/types';

import { ChartExportDropdown } from './ChartExportDropdown';

interface EChartActionsProps {
  chartInstance: any;
  exportPdf?: boolean;
  exportCsv?: boolean;
  exportExcel?: boolean;
  exportPng?: boolean;
  exportTitle?: string;
}

const generatePDF = async (image: any, title?: string) => {
  const pdfmake = await import('pdfmake/build/pdfmake.min');
  const { getFonts } = await import('@/table/exporters/pdf');

  const docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [30, 30, 30, 30],
    content: [
      title
        ? {
            text: title,
            fontSize: 10,
          }
        : null,
      {
        image,
        width: 530,
      },
    ],

    defaultStyle: {
      font: 'OpenSans',
    },
  };

  const fonts = getFonts();

  pdfmake
    .createPdf(docDefinition, null, fonts)
    .download((title || new Date().getTime()) + '.pdf');
};

export const EChartActions: FC<EChartActionsProps> = ({
  chartInstance,
  ...props
}) => {
  const makePdf = useCallback(() => {
    if (!chartInstance) return;
    const imagePng = decodeURIComponent(
      chartInstance.getDataURL({
        pixelRatio: 2,
        backgroundColor: '#fff',
        type: 'png',
        excludeComponents: ['toolbox'],
      }),
    );
    generatePDF(imagePng, props.exportTitle);
  }, [chartInstance, props.exportTitle]);

  const { showInfo } = useNotify();

  const exportData = useCallback(
    (format) => {
      if (!chartInstance) return;
      const options = chartInstance.getOption();
      const hasData = options.series?.[0]?.data?.length;

      if (!hasData) {
        showInfo(translate('Chart is empty'));
        return;
      }

      const exportData: ExportData = {
        fields: [],
        data: [],
      };
      exportData.fields = [options.xAxis?.[0]?.name || ''].concat(
        options.series.map((s) => s.name),
      );
      options.xAxis?.[0]?.data?.forEach((xDatum, i) => {
        const record = [];
        record.push(xDatum);
        options.series.forEach((serie) => {
          record.push(serie.data?.[i]?.value ?? serie.data?.[i]);
        });
        exportData.data.push(record);
      });

      exportAs(format, props.exportTitle, exportData);
    },
    [chartInstance, showInfo, props.exportTitle],
  );

  const handleExportPng = useCallback(() => {
    if (!chartInstance) return;
    const url = chartInstance.getDataURL({
      pixelRatio: 2,
      backgroundColor: '#fff',
      type: 'png',
      excludeComponents: ['toolbox'],
    });
    const link = document.createElement('a');
    link.href = url;
    link.download = `${props.exportTitle || 'chart'}.png`;
    link.click();
  }, [chartInstance, props.exportTitle]);

  const hasExport =
    props.exportPdf || props.exportCsv || props.exportExcel || props.exportPng;

  if (!hasExport) return null;

  return (
    <div className="d-flex justify-content-end w-100 px-1 pt-2">
      <ChartExportDropdown
        size="sm"
        disabled={!chartInstance}
        onExportPng={props.exportPng ? handleExportPng : undefined}
        onExportPdf={props.exportPdf ? makePdf : undefined}
        onExportCsv={props.exportCsv ? () => exportData('csv') : undefined}
        onExportExcel={
          props.exportExcel ? () => exportData('excel') : undefined
        }
      />
    </div>
  );
};
