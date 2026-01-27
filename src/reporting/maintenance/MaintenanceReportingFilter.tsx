import { CalendarBlankIcon } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import Flatpickr from 'react-flatpickr';

import { Select } from '@waldur/form/themed-select';
import { useFlatpickrTheme } from '@waldur/form/useFlatpickrTheme';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { MaintenanceFilterState } from './types';
import { MAINTENANCE_TYPE_LABELS, STATE_LABELS } from './utils';

interface PresetOption {
  value: string;
  label: string;
  getRange: () => { startDate: string; endDate: string };
}

interface StateOption {
  value: string;
  label: string;
}

interface MaintenanceTypeOption {
  value: number;
  label: string;
}

const presetOptions: PresetOption[] = [
  {
    value: 'last7',
    label: translate('Last 7 days'),
    getRange: () => ({
      startDate: DateTime.now().minus({ days: 7 }).toISODate()!,
      endDate: DateTime.now().toISODate()!,
    }),
  },
  {
    value: 'last30',
    label: translate('Last 30 days'),
    getRange: () => ({
      startDate: DateTime.now().minus({ days: 30 }).toISODate()!,
      endDate: DateTime.now().toISODate()!,
    }),
  },
  {
    value: 'last90',
    label: translate('Last 90 days'),
    getRange: () => ({
      startDate: DateTime.now().minus({ days: 90 }).toISODate()!,
      endDate: DateTime.now().toISODate()!,
    }),
  },
  {
    value: 'last365',
    label: translate('Last year'),
    getRange: () => ({
      startDate: DateTime.now().minus({ days: 365 }).toISODate()!,
      endDate: DateTime.now().toISODate()!,
    }),
  },
  {
    value: 'next30',
    label: translate('Next 30 days'),
    getRange: () => ({
      startDate: DateTime.now().toISODate()!,
      endDate: DateTime.now().plus({ days: 30 }).toISODate()!,
    }),
  },
  {
    value: 'next90',
    label: translate('Next 90 days'),
    getRange: () => ({
      startDate: DateTime.now().toISODate()!,
      endDate: DateTime.now().plus({ days: 90 }).toISODate()!,
    }),
  },
];

const stateOptions: StateOption[] = Object.entries(STATE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const maintenanceTypeOptions: MaintenanceTypeOption[] = Object.entries(
  MAINTENANCE_TYPE_LABELS,
).map(([value, label]) => ({ value: Number(value), label }));

interface MaintenanceReportingFilterProps {
  filter: MaintenanceFilterState;
  onFilterChange: (filter: Partial<MaintenanceFilterState>) => void;
}

export const MaintenanceReportingFilter: FC<
  MaintenanceReportingFilterProps
> = ({ filter, onFilterChange }) => {
  useFlatpickrTheme();

  // Find matching preset based on current dates
  const selectedPreset = useMemo(() => {
    return presetOptions.find((p) => {
      const range = p.getRange();
      return (
        range.startDate === filter.startDate && range.endDate === filter.endDate
      );
    });
  }, [filter.startDate, filter.endDate]);

  const selectedStates = stateOptions.filter((o) =>
    filter.states?.includes(o.value),
  );
  const selectedMaintenanceType = maintenanceTypeOptions.find(
    (o) => o.value === filter.maintenanceType,
  );

  return (
    <div className="d-flex flex-wrap gap-6 mb-6">
      <FormGroup label={translate('Preset')} className="flex-grow-1 mw-150px">
        <Select
          value={selectedPreset}
          onChange={(option: PresetOption | null) => {
            if (option) {
              onFilterChange(option.getRange());
            }
          }}
          options={presetOptions}
          isClearable={false}
          placeholder={translate('Custom')}
          className="metronic-select-container"
          classNamePrefix="metronic-select"
        />
      </FormGroup>

      <FormGroup
        label={translate('Start date')}
        className="flex-grow-1 mw-150px"
      >
        <div style={{ position: 'relative' }}>
          <Flatpickr
            value={filter.startDate}
            onChange={(dates) => {
              if (dates[0]) {
                onFilterChange({
                  startDate: DateTime.fromJSDate(dates[0]).toISODate()!,
                });
              }
            }}
            options={{
              dateFormat: 'Y-m-d',
              maxDate: filter.endDate,
            }}
            className="form-control"
            placeholder={translate('Start date')}
          />
          <span
            className="svg-icon svg-icon-2 svg-icon-gray-500"
            style={{
              position: 'absolute',
              right: 12,
              top: 13,
              pointerEvents: 'none',
            }}
          >
            <CalendarBlankIcon weight="bold" />
          </span>
        </div>
      </FormGroup>

      <FormGroup label={translate('End date')} className="flex-grow-1 mw-150px">
        <div style={{ position: 'relative' }}>
          <Flatpickr
            value={filter.endDate}
            onChange={(dates) => {
              if (dates[0]) {
                onFilterChange({
                  endDate: DateTime.fromJSDate(dates[0]).toISODate()!,
                });
              }
            }}
            options={{
              dateFormat: 'Y-m-d',
              minDate: filter.startDate,
            }}
            className="form-control"
            placeholder={translate('End date')}
          />
          <span
            className="svg-icon svg-icon-2 svg-icon-gray-500"
            style={{
              position: 'absolute',
              right: 12,
              top: 13,
              pointerEvents: 'none',
            }}
          >
            <CalendarBlankIcon weight="bold" />
          </span>
        </div>
      </FormGroup>

      <FormGroup label={translate('State')} className="flex-grow-1 mw-250px">
        <Select
          value={selectedStates}
          onChange={(options: StateOption[] | null) =>
            onFilterChange({
              states: options?.map((o) => o.value) || undefined,
            })
          }
          options={stateOptions}
          isMulti
          isClearable
          placeholder={translate('All states')}
          className="metronic-select-container"
          classNamePrefix="metronic-select"
        />
      </FormGroup>

      <FormGroup
        label={translate('Maintenance type')}
        className="flex-grow-1 mw-200px"
      >
        <Select
          value={selectedMaintenanceType}
          onChange={(option: MaintenanceTypeOption | null) =>
            onFilterChange({ maintenanceType: option?.value })
          }
          options={maintenanceTypeOptions}
          isClearable
          placeholder={translate('All types')}
          className="metronic-select-container"
          classNamePrefix="metronic-select"
        />
      </FormGroup>
    </div>
  );
};
