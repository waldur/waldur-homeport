import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { EChart } from './EChart';
import { EChartActions } from './EChartActions';

const sampleLineOptions = {
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    name: 'Month',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  },
  yAxis: {
    type: 'value',
    name: 'vCPU Cores',
  },
  series: [
    {
      name: 'Allocated vCPU',
      type: 'line',
      smooth: true,
      data: [120, 132, 101, 134, 90, 230],
    },
    {
      name: 'Used vCPU',
      type: 'line',
      smooth: true,
      data: [80, 95, 70, 110, 85, 190],
    },
  ],
};

const sampleBarOptions = {
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    name: 'Offering',
    data: ['OpenStack VM', 'Rancher K8s', 'S3 Storage', 'SLURM HPC'],
  },
  yAxis: {
    type: 'value',
    name: 'Cost (€)',
  },
  series: [
    {
      name: 'Cost',
      type: 'bar',
      data: [3200, 1800, 950, 4200],
    },
  ],
};

const meta: Meta<typeof EChart> = {
  title: 'Data Display/EChart',
  component: EChart,
  parameters: {
    docs: {
      description: {
        component:
          'Apache ECharts wrapper with automatic theme switching, resize observation, ' +
          'and built-in export actions (`EChartActions`). ' +
          'The export toolbar displays PDF, CSV, and Excel download triggers.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        className="p-6 border rounded bg-body shadow-sm"
        style={{ width: '100%', maxWidth: '750px', height: '420px' }}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof EChart>;

/**
 * Line chart displaying resource allocation over time, with PDF, CSV, and Excel export actions enabled.
 */
export const LineChartWithActions: Story = {
  args: {
    options: sampleLineOptions,
    exportPdf: true,
    exportCsv: true,
    exportExcel: true,
    exportTitle: 'Resource Allocation Trend',
  },
};

/**
 * Bar chart with export action triggers.
 */
export const BarChartWithActions: Story = {
  args: {
    options: sampleBarOptions,
    exportPdf: true,
    exportCsv: true,
    exportExcel: true,
    exportTitle: 'Monthly Offering Cost Breakdown',
  },
};

/**
 * Standalone story isolating the EChartActions export dropdown.
 * Tests opening the dropdown and selecting export formats.
 */
export const ActionsToolbarStandalone: Story = {
  render: () => {
    const mockChartInstance = {
      getDataURL: () =>
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      getOption: () => ({
        xAxis: [{ name: 'Date', data: ['Jan', 'Feb', 'Mar'] }],
        series: [
          { name: 'CPU', data: [{ value: 10 }, { value: 20 }, { value: 30 }] },
        ],
      }),
    };

    return (
      <div className="d-flex flex-column gap-4 p-4">
        <div className="text-muted fs-7">
          Export toolbar actions rendered via <code>EChartActions</code>:
        </div>
        <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-light">
          <span className="fw-semibold">Monthly Cloud Analytics</span>
          <EChartActions
            chartInstance={mockChartInstance}
            exportPdf={true}
            exportCsv={true}
            exportExcel={true}
            exportTitle="Cloud Analytics"
          />
        </div>
      </div>
    );
  },
};
