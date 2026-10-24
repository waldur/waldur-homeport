import { FC, useCallback, useRef } from 'react';
import { exportPdf as renderPdf } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import exportAs from '@/table/exporters';
import { getPdfTitle } from '@/table/exporters/pdfLimits';
import { saveFile } from '@/table/exporters/saveFile';
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

const getChartPng = (chartInstance) =>
  chartInstance.getDataURL({
    pixelRatio: 2,
    backgroundColor: '#fff',
    type: 'png',
    excludeComponents: ['toolbox'],
  });

export const EChartActions: FC<EChartActionsProps> = ({
  chartInstance,
  ...props
}) => {
  const { showInfo, showErrorResponse } = useNotify();

  // The server lays the chart out under its title, as it does table exports.
  // A second click while it renders would only download the same PDF twice.
  const rendering = useRef(false);
  const makePdf = useCallback(async () => {
    if (!chartInstance || rendering.current) return;
    rendering.current = true;
    try {
      const image = getChartPng(chartInstance).split(',')[1];
      const { data: pdf } = await renderPdf({
        body: { title: getPdfTitle(props.exportTitle), image },
      });
      saveFile(pdf, `${props.exportTitle || new Date().getTime()}.pdf`);
    } catch (e) {
      showErrorResponse(e, translate('Unable to export chart.'));
    } finally {
      rendering.current = false;
    }
  }, [chartInstance, props.exportTitle, showErrorResponse]);

  const exportData = useCallback(
    async (format) => {
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

      try {
        await exportAs(format, props.exportTitle, exportData);
      } catch (e) {
        showErrorResponse(e, translate('Unable to export chart.'));
      }
    },
    [chartInstance, showInfo, showErrorResponse, props.exportTitle],
  );

  const handleExportPng = useCallback(() => {
    if (!chartInstance) return;
    const url = getChartPng(chartInstance);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${props.exportTitle || 'chart'}.png`;
    link.click();
  }, [chartInstance, props.exportTitle]);

  const hasExport =
    props.exportPdf || props.exportCsv || props.exportExcel || props.exportPng;

  if (!hasExport) return null;

  return (
    <div className="flex justify-end w-full px-1 pt-2">
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
