import { FileCsvIcon, FileXlsIcon, PrinterIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showInfo } from '@waldur/store/notify';
import exportAs from '@waldur/table/exporters';
import { ExportData } from '@waldur/table/exporters/types';

import { Tip } from './Tooltip';

interface EChartActionsProps {
  chartInstance: any;
  exportPdf?: boolean;
  exportCsv?: boolean;
  exportExcel?: boolean;
  exportTitle?: string;
}

const generatePDF = async (image: any, title?: string) => {
  const pdfmake = await import('pdfmake/build/pdfmake.min');
  const { getFonts } = await import('@waldur/table/exporters/pdf');

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
  const dispatch = useDispatch();

  const makePdf = useCallback(() => {
    const imagePng = decodeURIComponent(
      chartInstance.getDataURL({
        pixelRatio: 2,
        backgroundColor: '#fff',
        type: 'png',
        excludeComponents: ['toolbox'],
      }),
    );
    generatePDF(imagePng, props.exportTitle);
  }, [chartInstance]);

  const exportData = useCallback(
    (format) => {
      const options = chartInstance.getOption();
      const hasData = options.series[0]?.data?.length;

      if (!hasData) {
        dispatch(showInfo(translate('Chart is empty')));
        return;
      }

      const exportData: ExportData = {
        fields: [],
        data: [],
      };
      exportData.fields = [options.xAxis[0].name].concat(
        options.series.map((s) => s.name),
      );
      options.xAxis[0].data.forEach((xDatum, i) => {
        const record = [];
        record.push(xDatum);
        options.series.forEach((serie) => {
          record.push(serie.data[i].value);
        });
        exportData.data.push(record);
      });

      exportAs(format, props.exportTitle, exportData);
    },
    [chartInstance],
  );

  return (
    (props.exportPdf || props.exportCsv || props.exportExcel) && (
      <div className="d-flex justify-content-end gap-2 px-1 pt-2">
        {props.exportPdf && (
          <Tip id="tip-echarts-pdf" label="PDF">
            <button
              type="button"
              className="text-btn text-hover-primary"
              onClick={makePdf}
            >
              <PrinterIcon size={20} />
            </button>
          </Tip>
        )}
        {props.exportCsv && (
          <Tip id="tip-echarts-csv" label="CSV">
            <button
              type="button"
              className="text-btn text-hover-primary"
              onClick={() => exportData('csv')}
            >
              <FileCsvIcon size={20} />
            </button>
          </Tip>
        )}
        {props.exportExcel && (
          <Tip id="tip-echarts-excel" label="Excel">
            <button
              type="button"
              className="text-btn text-hover-primary"
              onClick={() => exportData('excel')}
            >
              <FileXlsIcon size={20} />
            </button>
          </Tip>
        )}
      </div>
    )
  );
};
