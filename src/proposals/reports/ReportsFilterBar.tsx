import { FC, useMemo } from 'react';

import {
  BaseButton,
  DateRangePicker,
  HelpIcon,
  parseDateValue,
  Select,
  toIsoDate,
} from 'waldur-ui';

import { translate } from '@/i18n';

import { ScopeCall } from './api';
import {
  getDateFilterHint,
  hasActiveFilters,
  reportUsesDates,
} from './reportParams';
import { ReportFilters, ReportKind } from './types';

interface Option {
  value: string;
  label: string;
}

interface ReportsFilterBarProps {
  kind: ReportKind;
  filters: ReportFilters;
  onChange(filters: Partial<ReportFilters>): void;
  /** The calls in scope with their rounds. */
  calls: ScopeCall[];
  /** One call's reports: its call is fixed, so there is no call filter. */
  callLevel: boolean;
  /** The reports across every organization: an organization filter first. */
  global?: boolean;
}

/** A round chosen among `calls`, if it is still one of theirs. */
const keepsRound = (calls: ScopeCall[], round?: string) =>
  !round ||
  calls.some((call) => call.rounds.some((item) => item.uuid === round));

export const ReportsFilterBar: FC<ReportsFilterBarProps> = ({
  kind,
  filters,
  onChange,
  calls,
  callLevel,
  global = false,
}) => {
  const organizations = useMemo(
    () => (global ? (filters.organizations ?? []) : []),
    [global, filters.organizations],
  );
  const organizationOptions = useMemo<Option[]>(() => {
    const byUuid = new Map<string, string>();
    calls.forEach((call) =>
      byUuid.set(call.organizationUuid, call.organizationName),
    );
    return [...byUuid.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [calls]);

  // The calls of the chosen organizations, or of all of them.
  const organizationCalls = useMemo(
    () =>
      organizations.length
        ? calls.filter((call) => organizations.includes(call.organizationUuid))
        : calls,
    [calls, organizations],
  );
  // Grouped by organization when the calls come from more than one.
  const callOptions = useMemo(() => {
    const flat = organizationCalls.map((call) => ({
      value: call.uuid,
      label: call.name,
    }));
    const owners = new Set(organizationCalls.map((c) => c.organizationUuid));
    if (!global || owners.size < 2) {
      return flat;
    }
    return organizationOptions
      .filter((organization) => owners.has(organization.value))
      .map((organization) => ({
        label: organization.label,
        options: organizationCalls
          .filter((call) => call.organizationUuid === organization.value)
          .map((call) => ({ value: call.uuid, label: call.name })),
      }));
  }, [organizationCalls, organizationOptions, global]);
  const selectedCalls = useMemo(
    () =>
      organizationCalls
        .filter((call) => filters.calls.includes(call.uuid))
        .map((call) => ({ value: call.uuid, label: call.name })),
    [organizationCalls, filters.calls],
  );

  // The rounds of the chosen calls, or of every call shown when none is
  // chosen; grouped by call when there is more than one.
  const roundCalls = useMemo(
    () =>
      filters.calls.length
        ? calls.filter((call) => filters.calls.includes(call.uuid))
        : organizationCalls,
    [calls, organizationCalls, filters.calls],
  );
  const roundOptions = useMemo(
    () =>
      roundCalls.length === 1
        ? roundCalls[0].rounds.map((round) => ({
            value: round.uuid,
            label: round.name,
          }))
        : roundCalls
            .filter((call) => call.rounds.length)
            .map((call) => ({
              label: call.name,
              options: call.rounds.map((round) => ({
                value: round.uuid,
                label: round.name,
              })),
            })),
    [roundCalls],
  );
  const selectedRound = useMemo(() => {
    for (const call of calls) {
      const round = call.rounds.find((item) => item.uuid === filters.round);
      if (round) return { value: round.uuid, label: round.name };
    }
    return null;
  }, [calls, filters.round]);

  const usesDates = reportUsesDates(kind);
  const dateValue = useMemo<[Date, Date] | null>(() => {
    const from = parseDateValue(filters.from);
    const to = parseDateValue(filters.to);
    return from && to ? [from, to] : null;
  }, [filters.from, filters.to]);

  // Calls and a round of organizations no longer chosen would make the
  // report not found: they go with them.
  const changeOrganizations = (options: readonly Option[] | null) => {
    const uuids = (options ?? []).map((option) => option.value);
    const remaining = uuids.length
      ? calls.filter((call) => uuids.includes(call.organizationUuid))
      : calls;
    const keptCalls = filters.calls.filter((uuid) =>
      remaining.some((call) => call.uuid === uuid),
    );
    const change: Partial<ReportFilters> = { organizations: uuids };
    if (keptCalls.length !== filters.calls.length) {
      change.calls = keptCalls;
    }
    const roundScope = keptCalls.length
      ? remaining.filter((call) => keptCalls.includes(call.uuid))
      : remaining;
    if (!keepsRound(roundScope, filters.round)) {
      change.round = undefined;
    }
    onChange(change);
  };

  const changeCalls = (options: readonly Option[] | null) => {
    const uuids = (options ?? []).map((option) => option.value);
    const change: Partial<ReportFilters> = { calls: uuids };
    // A round of a call no longer chosen would make the report not found.
    if (
      filters.round &&
      uuids.length &&
      !calls.some(
        (call) =>
          uuids.includes(call.uuid) &&
          call.rounds.some((round) => round.uuid === filters.round),
      )
    ) {
      change.round = undefined;
    }
    onChange(change);
  };

  const active = hasActiveFilters(filters, kind);

  // Laid out as the card toolbar's own row, as UsageCard lays out its
  // controls: fixed widths, so a selection never shifts the controls beside
  // it, at one height, wrapping to full-width rows on a narrow screen.
  return (
    <>
      {global && (
        <Select
          inputId="call-reports-organizations"
          aria-label={translate('Organizations')}
          isMulti
          isClearable
          options={organizationOptions}
          value={organizationOptions.filter((option) =>
            organizations.includes(option.value),
          )}
          onChange={changeOrganizations}
          placeholder={translate('All organizations')}
          noOptionsMessage={() => translate('No organizations')}
          className="w-full sm:w-[280px]"
        />
      )}
      {!callLevel && (
        <Select
          inputId="call-reports-calls"
          aria-label={translate('Calls')}
          isMulti
          isClearable
          options={callOptions}
          value={selectedCalls}
          onChange={changeCalls}
          placeholder={translate('All calls')}
          noOptionsMessage={() => translate('No calls')}
          className="w-full sm:w-[280px]"
        />
      )}
      <Select
        inputId="call-reports-round"
        aria-label={translate('Round')}
        isClearable
        options={roundOptions}
        value={selectedRound}
        onChange={(option: Option | null) => onChange({ round: option?.value })}
        placeholder={translate('All rounds')}
        noOptionsMessage={() => translate('No rounds')}
        className="w-full sm:w-[300px]"
      />
      <div className="flex w-full items-center gap-1.5 sm:w-auto">
        <span
          id="call-reports-dates-label"
          className="whitespace-nowrap text-sm font-normal text-tertiary"
        >
          {translate('Submitted between')}
        </span>
        <div className="min-w-0 grow sm:w-[330px] sm:grow-0">
          <DateRangePicker
            id="call-reports-dates"
            aria-labelledby="call-reports-dates-label"
            value={usesDates ? dateValue : null}
            onChange={(range) =>
              onChange({
                from: range ? toIsoDate(range[0]) : undefined,
                to: range ? toIsoDate(range[1]) : undefined,
              })
            }
            clearable
            disabled={!usesDates}
          />
        </div>
        <HelpIcon
          label={getDateFilterHint(kind)}
          aria-label={translate('About these dates')}
        />
      </div>
      {active && (
        <BaseButton
          variant="tertiary"
          size="lg"
          label={translate('Clear filters')}
          onClick={() =>
            onChange({
              ...(global ? { organizations: [] } : {}),
              calls: [],
              round: undefined,
              from: undefined,
              to: undefined,
            })
          }
        />
      )}
    </>
  );
};
