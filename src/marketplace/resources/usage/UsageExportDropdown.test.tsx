import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotify } from '@/store/notify';
import exportAs from '@/table/exporters';

import {
  UsageExportDropdownProps,
  useUsageExport,
} from './UsageExportDropdown';

vi.mock('@/table/exporters');

describe('useUsageExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date('2024-01-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    resource: {
      name: 'Test Resource',
    },
    data: {
      components: [
        {
          name: 'CPU',
          type: 'cpu',
          measured_unit: 'cores',
          billing_type: 'fixed',
        },
        {
          name: 'RAM',
          type: 'ram',
          measured_unit: 'GB',
          billing_type: 'fixed',
        },
      ],

      usages: [
        { type: 'cpu', date: '2024-01-01', usage: 10 },
        { type: 'ram', date: '2024-01-01', usage: 8 },
      ],

      userUsages: [
        {
          username: 'user_1',
          component_type: 'cpu',
          date: '2024-01-01',
          usage: 5,
        },
        {
          username: 'user_1',
          component_type: 'ram',
          date: '2024-01-01',
          usage: 4,
        },
      ],
    },
    users: [
      {
        uuid: '123',
        username: '1b2f',
        full_name: 'User',
        offering_user_username: 'user_1',
      },
    ],

    months: 1,
  };

  it('should export data in the specified format', () => {
    const { result } = renderHook(() => useUsageExport(defaultProps as any));
    result.current('csv');

    expect(exportAs).toHaveBeenCalledWith(
      'csv',
      'Usage history - Test Resource',
      {
        fields: ['Username', 'Date', 'CPU/cores', 'RAM/GB'],
        data: [
          ['user_1', 'January 2024', 5, 4],
          ['Total of January 2024', 'January 2024', 10, 8],
          ['Total', '01/2024', 10, 8],
        ],
      },
    );
  });

  it('should export only the users passed in (mirrors the chart user filter)', () => {
    // Data contains usage for two users, but the caller narrows the filter
    // to user_1 only — the export must not leak the unselected user's rows.
    const propsWithTwoUsers = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        userUsages: [
          ...defaultProps.data.userUsages,
          {
            username: 'user_2',
            component_type: 'cpu',
            date: '2024-01-01',
            usage: 3,
          },
        ],
      },
      users: [
        {
          uuid: '123',
          username: '1b2f',
          full_name: 'User One',
          offering_user_username: 'user_1',
        },
      ],
    };

    const { result } = renderHook(() =>
      useUsageExport(propsWithTwoUsers as any),
    );
    result.current('csv');

    expect(exportAs).toHaveBeenCalledWith(
      'csv',
      'Usage history - Test Resource',
      {
        fields: ['Username', 'Date', 'CPU/cores', 'RAM/GB'],
        data: [
          ['user_1', 'January 2024', 5, 4],
          ['Total of January 2024', 'January 2024', 10, 8],
          ['Total', '01/2024', 10, 8],
        ],
      },
    );
  });

  it('should show error when there is no usage data', () => {
    const propsWithNoUsage = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        usages: [],
        userUsages: [],
      },
    };

    const { result } = renderHook(() =>
      useUsageExport(propsWithNoUsage as UsageExportDropdownProps),
    );
    result.current('csv');

    expect(useNotify().showError).toHaveBeenCalledWith('Chart is empty');
    expect(exportAs).not.toHaveBeenCalled();
  });

  it('should handle missing user usages', () => {
    const propsWithoutUserUsages = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        userUsages: [],
      },
    };

    const { result } = renderHook(() =>
      useUsageExport(propsWithoutUserUsages as any),
    );
    result.current('excel');

    expect(exportAs).toHaveBeenCalledWith(
      'excel',
      'Usage history - Test Resource',
      {
        fields: ['Date', 'CPU/cores', 'RAM/GB'],
        data: [
          ['January 2024', 10, 8],
          ['Total', 10, 8],
        ],
      },
    );
  });

  it('should handle components without measured units', () => {
    const propsWithoutUnits = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        components: [
          {
            name: 'CPU',
            type: 'cpu',
            billing_type: 'fixed',
            uuid: 'cpu-1',
            description: 'CPU component',
          },
          {
            name: 'RAM',
            type: 'ram',
            billing_type: 'fixed',
            uuid: 'ram-1',
            description: 'RAM component',
          },
        ],
      },
    };

    const { result } = renderHook(() =>
      useUsageExport(propsWithoutUnits as any),
    );
    result.current('pdf');

    expect(exportAs).toHaveBeenCalledWith(
      'pdf',
      'Usage history - Test Resource',
      {
        fields: ['Username', 'Date', 'CPU', 'RAM'],
        data: [
          ['user_1', 'January 2024', 5, 4],
          ['Total of January 2024', 'January 2024', 10, 8],
          ['Total', '01/2024', 10, 8],
        ],
      },
    );
  });

  it('should handle N/A values for missing usage data', () => {
    const propsWithMissingUsage = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        usages: [{ type: 'cpu', date: '2024-01-01', usage: 10 }], // Remove RAM usage
      },
    };

    const { result } = renderHook(() =>
      useUsageExport(propsWithMissingUsage as any),
    );
    result.current('csv');

    expect(exportAs).toHaveBeenCalledWith(
      'csv',
      'Usage history - Test Resource',
      {
        fields: ['Username', 'Date', 'CPU/cores', 'RAM/GB'],
        data: [
          ['user_1', 'January 2024', 5, '0'],
          ['Total of January 2024', 'January 2024', 10, 'N/A'],
          ['Total', '01/2024', 10, 'N/A'],
        ],
      },
    );
  });
});
