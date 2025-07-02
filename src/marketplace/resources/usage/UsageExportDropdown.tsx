import {
  FileCsvIcon,
  FileXlsIcon,
  PrinterIcon,
  FilePngIcon,
} from '@phosphor-icons/react';
import { init } from 'echarts';
import { sum } from 'lodash-es';
import { useCallback } from 'react';
import { DropdownButton } from 'react-bootstrap';
import { ProjectUser } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { useNotify } from '@waldur/store/hooks';
import exportAs from '@waldur/table/exporters';
import { ExportData } from '@waldur/table/exporters/types';

import { ComponentUsage, ComponentUserUsage } from './types';
import {
  getFormattedUsages,
  getTotalUsagePeriod,
  getUsagePeriods,
  getEChartOptions,
} from './utils';

export interface UsageExportDropdownProps {
  resource: {
    name: string;
  };
  data: {
    components: OfferingComponent[];
    usages: ComponentUsage[];
    userUsages: ComponentUserUsage[];
  };
  users: ProjectUser[];
  months: number;
}

const exportAsPng = (props: UsageExportDropdownProps) => {
  const color = ENV.plugins.WALDUR_CORE.BRAND_COLOR;
  let exportSuccessed = false;

  props.data.components.forEach((component, index) => {
    const options = getEChartOptions(
      component,
      props.data.usages,
      props.data.userUsages,
      props.months,
      color,
    );

    const hasData = options.series.some((serie) =>
      serie.data.some((datum) => Number(datum.value) !== 0),
    );
    if (!hasData) {
      return;
    }

    Object.assign(options, { animation: false });
    Object.assign(options, {
      title: {
        text: translate('Usage history') + ' - ' + component.name,
        subtext: props.resource.name,
        left: 'center',
        textStyle: {
          fontSize: 16,
          color: '#333',
        },
        subtextStyle: {
          fontSize: 14,
          color: '#666',
        },
      },
    });

    // Create a virtual chart container only for export, remove it later
    const container = document.createElement('div');
    container.style.width = '1600px';
    container.style.height = '800px';
    document.body.appendChild(container);

    const chartInstance = init(container);
    chartInstance.setOption(options);

    const dataURL = chartInstance.getDataURL({
      type: 'png',
      backgroundColor: '#fff',
      pixelRatio: 2,
      excludeComponents: ['toolbox'],
    });

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `usage-${component.name}-${index + 1}-${new Date().toISOString()}.png`;
    link.click();

    chartInstance.dispose();
    document.body.removeChild(container);

    exportSuccessed = true;
  });

  return exportSuccessed;
};

export const useUsageExport = (props: UsageExportDropdownProps) => {
  const { showError } = useNotify();

  return useCallback(
    (format) => {
      if (format === 'png') {
        const result = exportAsPng(props);
        if (!result) {
          showError(translate('Chart is empty'));
        }
        return;
      }

      const usages = props.data.usages;
      const userUsages = props.data.userUsages;
      const components = props.data.components;

      const hasUserStats = Boolean(userUsages?.length);
      const exportData: ExportData = {
        fields: [],
        data: [],
      };
      // Prepare headers
      exportData.fields = [
        hasUserStats ? translate('Username') : null,
        translate('Date'),
      ]
        .concat(
          props.data.components.map(
            (c) => c.name + (c.measured_unit ? '/' + c.measured_unit : ''),
          ),
        )
        .filter(Boolean);

      // Prepare data
      const { labels, periods } = getUsagePeriods(usages, props.months);
      const allFormattedUsages = components.map((component) =>
        getFormattedUsages(
          periods,
          usages.filter((usage) => usage.type === component.type),
          userUsages?.filter(
            (usage) => usage.component_type === component.type,
          ),
        ),
      );

      labels.forEach((label, monthIndex) => {
        const hasUsage = allFormattedUsages.some((compUsages) =>
          Number(compUsages[monthIndex]?.value),
        );
        if (hasUsage) {
          if (hasUserStats) {
            // For each user, if has usage for at least one component per month, add it
            props.users.forEach((user) => {
              const hasUserUsage = allFormattedUsages.some((compUsages) =>
                compUsages[monthIndex]?.details.some(
                  (uu) =>
                    uu.username === user.offering_user_username &&
                    Number(uu.usage),
                ),
              );

              if (hasUserUsage) {
                const userRecord: any[] = [user.offering_user_username, label];
                userRecord.push(
                  ...allFormattedUsages.map((compUsages) => {
                    const userUsage = compUsages[monthIndex]?.details.find(
                      (uu) => uu.username === user.offering_user_username,
                    );
                    return userUsage?.usage || '0';
                  }),
                );
                exportData.data.push(userRecord);
              }
            });
          }

          // Add Total of month
          const record: any[] = hasUserStats
            ? [translate('Total of {label}', { label }), label]
            : [label];
          record.push(
            ...allFormattedUsages.map(
              (compUsages) => compUsages[monthIndex]?.value || 'N/A',
            ),
          );
          exportData.data.push(record);
        }
      });

      if (exportData.data?.length > 0) {
        // Add total for all months
        const totalPeriod = getTotalUsagePeriod(usages);

        const totalRecord: any[] = hasUserStats
          ? [translate('Total'), totalPeriod]
          : [translate('Total')];
        totalRecord.push(
          ...allFormattedUsages.map(
            (compUsages) =>
              sum(compUsages.map((usage) => Number(usage?.value))) || 'N/A',
          ),
        );
        exportData.data.push(totalRecord);
      }

      if (!exportData.data.length) {
        showError(translate('Chart is empty'));
        return;
      }

      exportAs(
        format,
        translate('Usage history') + ' - ' + props.resource.name,
        exportData,
      );
    },
    [props],
  );
};

export const UsageExportDropdown = (props: UsageExportDropdownProps) => {
  const exportUsages = useUsageExport(props);

  return (
    <DropdownButton
      variant="outline btn-outline-default"
      title={translate('Export all')}
    >
      <ActionItem
        title={translate('PNG')}
        action={() => exportUsages('png')}
        iconNode={<FilePngIcon weight="bold" />}
      />

      <ActionItem
        title={translate('PDF')}
        action={() => exportUsages('pdf')}
        iconNode={<PrinterIcon weight="bold" />}
      />

      <ActionItem
        title={translate('CSV')}
        action={() => exportUsages('csv')}
        iconNode={<FileCsvIcon weight="bold" />}
      />

      <ActionItem
        title={translate('Excel')}
        action={() => exportUsages('excel')}
        iconNode={<FileXlsIcon weight="bold" />}
      />
    </DropdownButton>
  );
};
