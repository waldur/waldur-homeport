import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceComponentUsagesList,
} from 'waldur-js-client';

import { OfferingComponent } from '@/marketplace/types';

import { ComponentUsage, ComponentUserUsage } from './types';
import {
  getComponentsAndUsages,
  getEChartOptions,
  getTotalUsagePeriod,
  getUsageHistoryPeriodOptions,
} from './utils';

vi.mock('waldur-js-client');

describe('ResourceUsageChart', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should filter usages by component type', () => {
    const component: OfferingComponent = {
      type: 'ram',
      name: 'RAM',
      measured_unit: 'GB',
      billing_type: 'usage',
    } as OfferingComponent;

    const usages: ComponentUsage[] = [
      {
        type: 'ram',
        usage: 10,
        description: 'RAM usage',
        billing_period: '2024-03-01',
      },
      {
        type: 'cpu',
        usage: 4,
        description: 'CPU usage',
        billing_period: '2024-03-01',
      },
    ] as ComponentUsage[];

    const result = getEChartOptions(
      component,
      usages,
      [],
      1,
      '#1f77b4',
      vi.fn(),
    );

    // Limit series is hidden because all total_allocated values are 0.
    expect(result.series).toHaveLength(1);
    const usageSeries = result.series[0];
    expect(usageSeries.name).toBe('Usage');
    expect(usageSeries.data).toHaveLength(1);
    expect(usageSeries.data[0].value).toBe(10);
    expect(usageSeries.data[0].description).toBe('RAM usage');
  });

  it('should filter usages by billing period', () => {
    const component: OfferingComponent = {
      type: 'ram',
      name: 'RAM',
      measured_unit: 'GB',
      billing_type: 'usage',
    } as OfferingComponent;

    const usages: ComponentUsage[] = [
      {
        type: 'ram',
        usage: 10,
        description: 'March usage',
        billing_period: '2024-03-01',
      },
      {
        type: 'ram',
        usage: 8,
        description: 'February usage',
        billing_period: '2024-02-01',
      },
      {
        type: 'ram',
        usage: 6,
        description: 'January usage',
        billing_period: '2024-01-01',
      },
    ] as ComponentUsage[];

    // Only show last 2 months
    const result = getEChartOptions(
      component,
      usages,
      [],
      2,
      '#1f77b4',
      vi.fn(),
    );

    // Limit series hidden (no allocations); usage is the only series.
    expect(result.series).toHaveLength(1);
    const usageSeries = result.series[0];
    expect(usageSeries.name).toBe('Usage');
    expect(usageSeries.data).toHaveLength(2);
    expect(usageSeries.data[0].value).toBe(8);
    expect(usageSeries.data[0].description).toBe('February usage');
    expect(usageSeries.data[1].value).toBe(10);
    expect(usageSeries.data[1].description).toBe('March usage');
  });

  it('should generate tooltip with user usage details', () => {
    const component: OfferingComponent = {
      type: 'cpu',
      name: 'CPU',
      measured_unit: 'cores',
      billing_type: 'usage',
    } as OfferingComponent;

    const usages: ComponentUsage[] = [
      {
        uuid: 'usage-1',
        type: 'cpu',
        name: 'CPU Usage',
        measured_unit: 'cores',
        usage: 16,
        description: 'Total CPU cores used',
        billing_period: '2024-03-01',
        date: '2024-03-01',
        recurring: false,
      } as ComponentUsage,
    ];

    const userUsages: ComponentUserUsage[] = [
      {
        uuid: 'user-1',
        component_type: 'cpu',
        component_usage: 'usage-1',
        username: 'Alice',
        user: 'user-1-uuid',
        usage: 10,
        measured_unit: 'cores',
        description: 'Alice CPU usage',
        date: '2024-03-01',
        billing_period: '2024-03-01',
        plan_period: '2024-03',
        is_visible: true,
        recurring: false,
        created: '2024-03-01',
        modified: '2024-03-01',
        scope: null,
        backend_id: 'backend-1',
        resource_name: 'Resource 1',
        resource_uuid: 'resource-1',
        offering_name: 'CPU Offering',
        offering_uuid: 'offering-1',
        customer_name: 'Customer 1',
        customer_uuid: 'customer-1',
        project_name: 'Project 1',
        project_uuid: 'project-1',
      } as ComponentUserUsage,
      {
        uuid: 'user-2',
        component_type: 'cpu',
        component_usage: 'usage-1',
        username: 'Bob',
        user: 'user-2-uuid',
        usage: 6,
        measured_unit: 'cores',
        description: 'Bob CPU usage',
        date: '2024-03-01',
        billing_period: '2024-03-01',
        plan_period: '2024-03',
        is_visible: true,
        recurring: false,
        created: '2024-03-01',
        modified: '2024-03-01',
        scope: null,
        backend_id: 'backend-2',
        resource_name: 'Resource 1',
        resource_uuid: 'resource-1',
        offering_name: 'CPU Offering',
        offering_uuid: 'offering-1',
        customer_name: 'Customer 1',
        customer_uuid: 'customer-1',
        project_name: 'Project 1',
        project_uuid: 'project-1',
      } as ComponentUserUsage,
    ];

    const result = getEChartOptions(
      component,
      usages,
      userUsages,
      1,
      '#1f77b4',
      vi.fn(),
    );
    const usageSeries = result.series[0];
    const tooltipFormatter = result.tooltip.formatter;
    const tooltipParams = [
      {
        axisValue: 'March 2024',
        marker:
          '<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#1f77b4;"></span>',
        seriesName: 'Usage',
        data: usageSeries.data[0],
      },
    ];

    const tooltipContent = tooltipFormatter(tooltipParams);

    expect(tooltipContent).toContain('March 2024');
    expect(tooltipContent).toContain('Usage: <b>16</b>');
    expect(tooltipContent).toContain('(Total CPU cores used)');

    expect(tooltipContent).toContain('Details:');
    expect(tooltipContent).toContain('Alice - 10 cores');
    expect(tooltipContent).toContain('Bob - 6 cores');

    expect(usageSeries.data[0]).toEqual({
      value: 16,
      description: 'Total CPU cores used',
      details: expect.arrayContaining([
        expect.objectContaining({
          username: 'Alice',
          usage: 10,
          measured_unit: 'cores',
        }),
        expect.objectContaining({
          username: 'Bob',
          usage: 6,
          measured_unit: 'cores',
        }),
      ]),
    });
  });

  it('should hide limit series when all allocations are zero', () => {
    const component: OfferingComponent = {
      type: 'cpu',
      name: 'CPU',
      measured_unit: 'cores',
      billing_type: 'usage',
    } as OfferingComponent;

    const usages: ComponentUsage[] = [
      {
        type: 'cpu',
        usage: 10,
        description: 'CPU usage',
        billing_period: '2024-03-01',
      },
    ] as ComponentUsage[];

    const result = getEChartOptions(component, usages, [], 1, '#1f77b4');

    expect(result.series).toHaveLength(1);
    expect(result.series[0].name).toBe('Usage');
  });

  it('should show limit series when at least one allocation is non-zero', () => {
    const component: OfferingComponent = {
      type: 'cpu',
      name: 'CPU',
      measured_unit: 'cores',
      billing_type: 'limit',
    } as OfferingComponent;

    const usages: ComponentUsage[] = [
      {
        type: 'cpu',
        usage: 10,
        total_allocated: 100,
        description: 'CPU usage',
        billing_period: '2024-03-01',
      },
    ] as ComponentUsage[];

    const result = getEChartOptions(component, usages, [], 1, '#1f77b4');

    expect(result.series).toHaveLength(2);
    expect(result.series[0].name).toBe('Limit');
    expect(result.series[0].data[0].value).toBe(100);
    expect(result.series[1].name).toBe('Usage');
  });

  it('should omit Limit row from tooltip when its value is zero on usage-based components', () => {
    const component: OfferingComponent = {
      type: 'cpu',
      name: 'CPU',
      measured_unit: 'cores',
      billing_type: 'usage',
    } as OfferingComponent;

    const usages: ComponentUsage[] = [
      {
        type: 'cpu',
        usage: 10,
        total_allocated: 100,
        description: 'February usage',
        billing_period: '2024-02-01',
      },
      {
        type: 'cpu',
        usage: 5,
        total_allocated: 0,
        description: 'March usage',
        billing_period: '2024-03-01',
      },
    ] as ComponentUsage[];

    const result = getEChartOptions(component, usages, [], 2, '#1f77b4');
    const tooltipFormatter = result.tooltip.formatter;

    const marchTooltip = tooltipFormatter([
      {
        axisValue: 'March 2024',
        marker: '',
        seriesName: 'Limit',
        data: result.series[0].data[1],
      },
      {
        axisValue: 'March 2024',
        marker: '',
        seriesName: 'Usage',
        data: result.series[1].data[1],
      },
    ]);
    expect(marchTooltip).not.toContain('Limit:');
    expect(marchTooltip).toContain('Usage: <b>5</b>');

    const februaryTooltip = tooltipFormatter([
      {
        axisValue: 'February 2024',
        marker: '',
        seriesName: 'Limit',
        data: result.series[0].data[0],
      },
      {
        axisValue: 'February 2024',
        marker: '',
        seriesName: 'Usage',
        data: result.series[1].data[0],
      },
    ]);
    expect(februaryTooltip).toContain('Limit: <b>100</b>');
    expect(februaryTooltip).toContain('Usage: <b>10</b>');
  });

  it('should keep Limit series on limit-based components but omit Limit: 0 from the tooltip', () => {
    const component: OfferingComponent = {
      type: 'cpu',
      name: 'CPU',
      measured_unit: 'cores',
      billing_type: 'limit',
    } as OfferingComponent;

    const usages: ComponentUsage[] = [
      {
        type: 'cpu',
        usage: 0,
        total_allocated: 0,
        description: 'March usage',
        billing_period: '2024-03-01',
      },
    ] as ComponentUsage[];

    const result = getEChartOptions(component, usages, [], 1, '#1f77b4');

    expect(result.series).toHaveLength(2);
    expect(result.series[0].name).toBe('Limit');

    const tooltipFormatter = result.tooltip.formatter;
    const marchTooltip = tooltipFormatter([
      {
        axisValue: 'March 2024',
        marker: '',
        seriesName: 'Limit',
        data: result.series[0].data[0],
      },
      {
        axisValue: 'March 2024',
        marker: '',
        seriesName: 'Usage',
        data: result.series[1].data[0],
      },
    ]);
    expect(marchTooltip).not.toContain('Limit:');
    expect(marchTooltip).toContain('Usage: <b>0</b>');
  });

  describe('getUsageHistoryPeriodOptions', () => {
    it('should return default options when start date is recent', () => {
      // 3 months ago
      const startDate = '2023-12-01';
      const options = getUsageHistoryPeriodOptions(startDate);
      expect(options).toHaveLength(1);
      expect(options[0]).toEqual({ value: 4, label: 'From creation' });
    });

    it('should return 6 months option when start date is older than 6 months', () => {
      // 8 months ago
      const startDate = '2023-07-01';
      const options = getUsageHistoryPeriodOptions(startDate);
      expect(options).toHaveLength(2);
      expect(options[0].value).toBe(6);
      expect(options[1].value).toBe(9);
    });

    it('should return 12 months option when start date is older than 12 months', () => {
      // 14 months ago
      const startDate = '2023-01-01';
      const options = getUsageHistoryPeriodOptions(startDate);
      expect(options).toHaveLength(3);
      expect(options[0].value).toBe(6);
      expect(options[1].value).toBe(12);
      expect(options[2].value).toBe(15);
    });

    it('should use abbreviated labels when requested', () => {
      const startDate = '2023-01-01';
      const options = getUsageHistoryPeriodOptions(startDate, true);
      expect(options[0].label).toBe('6M');
    });
  });

  describe('getTotalUsagePeriod', () => {
    it('should return range of billing periods', () => {
      const usages: ComponentUsage[] = [
        { type: 'ram', billing_period: '2024-01-01' },
        { type: 'ram', billing_period: '2024-03-01' },
        { type: 'cpu', billing_period: '2024-02-01' },
      ] as ComponentUsage[];

      const result = getTotalUsagePeriod(usages);
      expect(result).toBe('01/2024 - 03/2024');
    });

    it('should filter by component type if provided', () => {
      const usages: ComponentUsage[] = [
        { type: 'ram', billing_period: '2024-01-01' },
        { type: 'ram', billing_period: '2024-03-01' },
        { type: 'cpu', billing_period: '2023-12-01' },
      ] as ComponentUsage[];

      const component = { type: 'ram' } as OfferingComponent;
      const result = getTotalUsagePeriod(usages, component);
      expect(result).toBe('01/2024 - 03/2024');
    });

    it('should return single period if min and max are same', () => {
      const usages: ComponentUsage[] = [
        { type: 'ram', billing_period: '2024-01-01' },
      ] as ComponentUsage[];

      const result = getTotalUsagePeriod(usages);
      expect(result).toBe('01/2024');
    });

    it('should return dash if no usages', () => {
      expect(getTotalUsagePeriod([])).toBe('—');
    });
  });

  describe('getComponentsAndUsages', () => {
    it('should return empty state when offering retrieval fails with 404', async () => {
      vi.mocked(marketplaceResourcesOfferingRetrieve).mockRejectedValue({
        response: { status: 404 },
      });

      const result = await getComponentsAndUsages('resource-uuid', 1);

      expect(result).toEqual({
        components: [],
        usages: [],
        userUsages: [],
      });
    });

    it('should throw error when offering retrieval fails with other status', async () => {
      vi.mocked(marketplaceResourcesOfferingRetrieve).mockRejectedValue({
        response: { status: 500 },
        message: 'Internal Server Error',
      });

      await expect(getComponentsAndUsages('resource-uuid', 1)).rejects.toThrow(
        'Error while getting offering, Internal Server Error',
      );
    });

    it('should return empty lists when usage list retrieval fails with 404', async () => {
      vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
        data: { components: [] },
      } as any);
      vi.mocked(marketplaceComponentUsagesList).mockRejectedValue({
        response: { status: 404 },
      });

      const result = await getComponentsAndUsages('resource-uuid', 1);

      expect(result.usages).toEqual([]);
      expect(result.userUsages).toEqual([]);
    });
  });
});
