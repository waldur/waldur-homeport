import { init } from 'echarts';
import { useCallback, useRef } from 'react';
import { ProjectUser, OfferingComponent } from 'waldur-js-client';

import { ChartExportDropdown } from '@/core/ChartExportDropdown';
import { saveChartPng } from '@/core/chartPng';
import { getBrandColor } from '@/core/utils';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import exportAs from '@/table/exporters';
import { ExportData } from '@/table/exporters/types';

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
    components: Pick<
      OfferingComponent,
      'name' | 'type' | 'measured_unit' | 'billing_type'
    >[];
    usages: Pick<
      ComponentUsage,
      | 'component_type'
      | 'type'
      | 'billing_period'
      | 'usage'
      | 'total_consumed'
      | 'total_allocated'
    >[];
    userUsages: Pick<
      ComponentUserUsage,
      'component_type' | 'billing_period' | 'username'
    >[];
  };
  users: ProjectUser[];
  months: number;
}

const exportAsPng = (props: UsageExportDropdownProps) => {
  const color = getBrandColor();
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
        text: translate('Usage history - {component}', {
          component: component.name,
        }),
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

    saveChartPng(
      chartInstance,
      `usage-${component.name}-${index + 1}-${new Date().toISOString()}`,
      '#fff',
    );

    chartInstance.dispose();
    document.body.removeChild(container);

    exportSuccessed = true;
  });

  return exportSuccessed;
};

export const useUsageExport = (props: UsageExportDropdownProps) => {
  const { showError, showErrorResponse } = useNotify();
  // A PDF takes a server round trip; a second click meanwhile would only
  // download it twice.
  const exporting = useRef(false);

  return useCallback(
    async (format) => {
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
      // Roster from the usage records (incl. robot accounts); non-empty users prop = active filter
      const filterUsernames = props.users?.length
        ? props.users.map((user) => user.offering_user_username)
        : null;
      const usernames = [
        ...new Set((userUsages || []).map((usage) => usage.username)),
      ]
        .filter(
          (username) => !filterUsernames || filterUsernames.includes(username),
        )
        .sort((a, b) => a.localeCompare(b));
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
            // For each username, if has usage for at least one component per month, add it
            usernames.forEach((username) => {
              const hasUserUsage = allFormattedUsages.some((compUsages) =>
                compUsages[monthIndex]?.details.some(
                  (uu) => uu.username === username && Number(uu.usage),
                ),
              );

              if (hasUserUsage) {
                const userRecord: any[] = [username, label];
                userRecord.push(
                  ...allFormattedUsages.map((compUsages) => {
                    const userUsage = compUsages[monthIndex]?.details.find(
                      (uu) => uu.username === username,
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
              compUsages.reduce(
                (total, usage) => total + Number(usage?.value),
                0,
              ) || 'N/A',
          ),
        );
        exportData.data.push(totalRecord);
      }

      if (!exportData.data.length) {
        showError(translate('Chart is empty'));
        return;
      }

      // A PDF is rendered on the server, which can refuse it.
      if (exporting.current) return;
      exporting.current = true;
      try {
        await exportAs(
          format,
          translate('Usage history - {resource}', {
            resource: props.resource.name,
          }),
          exportData,
        );
      } catch (e) {
        showErrorResponse(e, translate('Unable to export usage.'));
      } finally {
        exporting.current = false;
      }
    },
    [props],
  );
};

export const UsageExportDropdown = (props: UsageExportDropdownProps) => {
  const exportUsages = useUsageExport(props);

  return (
    <ChartExportDropdown
      label={translate('Export all')}
      size="lg"
      onExportPng={() => exportUsages('png')}
      onExportPdf={() => exportUsages('pdf')}
      onExportCsv={() => exportUsages('csv')}
      onExportExcel={() => exportUsages('excel')}
    />
  );
};
