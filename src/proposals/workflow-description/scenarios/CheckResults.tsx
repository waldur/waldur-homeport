import { FC, useMemo } from 'react';
import {
  ScenarioCoverage,
  ScenarioResult,
  ScenarioTotals,
} from 'waldur-js-client';

import { Badge, BaseButton, EmptyState } from 'waldur-ui';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useRowsTable } from '@/table/useRowsTable';
import { renderFieldOrDash } from '@/table/utils';

import { PathSteps } from '../diagram/WorkflowPathsPanel';
import { OpenStep } from '../RoleMatrix';
import { useValidationTableExport } from '../validationExport';

import {
  assertionText,
  scenarioCount,
  scenarioOutcome,
  ScenarioRow,
  stepNames,
} from './checks';

const SCENARIO_BADGES = {
  passed: { variant: 'success', label: () => translate('Passed') },
  failed: { variant: 'danger', label: () => translate('Failed') },
  error: { variant: 'warning', label: () => translate('Could not run') },
} as const;

const ScenarioStatus: FC<{ status: ScenarioResult['status'] }> = ({
  status,
}) => {
  const badge = SCENARIO_BADGES[status];
  return (
    <Badge variant={badge.variant} size="sm" tone="outline">
      {badge.label()}
    </Badge>
  );
};

const NotRunYet = () => (
  <span className="text-quaternary whitespace-nowrap">
    {translate('Not run yet')}
  </span>
);

/**
 * The saved scenarios: each by name and what it checks, listed before it
 * has ever run, with how it went when last run -- the path it walked and
 * the first assertion that did not hold.
 */
export const ScenariosTable: FC<{
  name: string;
  rows: ScenarioRow[];
  loaded: unknown;
  names: Map<string, string>;
  /** With the last result of each and why it failed: on a call, where
   * scenarios run. */
  withResults: boolean;
  onOpenStep?: OpenStep;
}> = ({ name, rows, loaded, names, withResults, onOpenStep }) => {
  const tableProps = useRowsTable(name, rows, loaded);
  const exportProps = useValidationTableExport();
  const Details = useMemo(
    () =>
      function ScenarioDetails({ row }: { row: ScenarioRow }) {
        const result = row.result;
        return (
          <ExpandableContainer>
            {result?.path.length ? (
              <p className="mb-2.5">
                <PathSteps
                  steps={result.path.map(([key, value]) => ({
                    key,
                    result: value,
                  }))}
                  names={names}
                />
              </p>
            ) : null}
            {result?.assertions.length ? (
              <ul className="list-unstyled mb-0">
                {result.assertions.map((assertion, index) => (
                  <li key={index} className="py-1">
                    <Badge
                      variant={assertion.passed ? 'success' : 'danger'}
                      size="sm"
                      tone="outline"
                      className="me-1.5"
                    >
                      {assertion.passed
                        ? translate('Holds')
                        : translate('Fails')}
                    </Badge>
                    {assertionText(assertion.assertion, names)}
                    {assertion.message ? (
                      <span className="text-quaternary">
                        {' '}
                        — {assertion.message}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : row.assertions.length ? (
              <>
                <p className="text-quaternary text-xs mb-1.5">
                  {translate('What the scenario checks at its end:')}
                </p>
                <ul className="mb-0" data-testid="scenario-assertions">
                  {row.assertions.map((assertion, index) => (
                    <li key={index} className="py-1">
                      {assertionText(assertion, names)}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <EmptyState
                size="sm"
                message={translate(
                  'Run the scenarios to see what this one checks.',
                )}
              />
            )}
          </ExpandableContainer>
        );
      },
    [names],
  );
  const scenarioColumn: Column<ScenarioRow> = {
    title: translate('Scenario'),
    ellipsis: false,
    export: (row) =>
      row.description ? `${row.name}: ${row.description}` : row.name,
    render: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-medium text-primary">{row.name}</span>
        {row.description ? (
          <span className="text-quaternary">{row.description}</span>
        ) : null}
      </div>
    ),
  };
  const resultColumns: Column<ScenarioRow>[] = [
    {
      title: translate('Last result'),
      ellipsis: false,
      export: (row) =>
        row.result
          ? SCENARIO_BADGES[row.result.status].label()
          : translate('Not run yet'),
      render: ({ row }) =>
        row.result ? (
          <ScenarioStatus status={row.result.status} />
        ) : (
          <NotRunYet />
        ),
    },
    {
      title: translate('Why'),
      ellipsis: false,
      export: (row) =>
        row.result?.error ?? row.result?.failure?.message ?? DASH_ESCAPE_CODE,
      render: ({ row }) => {
        const result = row.result;
        if (!result) return renderFieldOrDash(null);
        if (result.error) return <span>{result.error}</span>;
        if (!result.failure) return renderFieldOrDash(null);
        const step = result.failure.step;
        return (
          <span>
            {result.failure.message}
            {step && onOpenStep ? (
              <>
                {' '}
                <BaseButton
                  variant="text-primary"
                  className="p-0"
                  label={translate('Open {step}', {
                    step: names.get(step) ?? step,
                  })}
                  onClick={() => onOpenStep(step, 'basics')}
                />
              </>
            ) : null}
          </span>
        );
      },
    },
  ];
  return (
    <Table<ScenarioRow>
      {...tableProps}
      {...exportProps}
      showPageSizeSelector
      columns={
        withResults ? [scenarioColumn, ...resultColumns] : [scenarioColumn]
      }
      verboseName={translate('scenarios')}
      expandableRow={Details}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

/**
 * How many scenarios there are and how the last run went: "5 scenarios ·
 * 5 passed", or "not run yet" before they have ever run.
 */
export const ScenarioCounts: FC<{
  count: number;
  totals?: ScenarioTotals | null;
}> = ({ count, totals }) => {
  if (!count && !totals?.total) {
    return (
      <span
        className="text-quaternary whitespace-nowrap"
        data-testid="scenario-counts"
      >
        {translate('No scenarios')}
      </span>
    );
  }
  const outcome = totals?.total ? scenarioOutcome(totals) : null;
  return (
    <span
      className="inline-flex items-center gap-2 whitespace-nowrap"
      data-testid="scenario-counts"
    >
      <span>{scenarioCount(count || totals?.total || 0)}</span>
      <span className="text-quaternary" aria-hidden>
        ·
      </span>
      {outcome ? (
        <Badge variant={outcome.variant} size="sm" tone="outline">
          {outcome.label}
        </Badge>
      ) : (
        <span className="text-quaternary">{translate('not run yet')}</span>
      )}
    </span>
  );
};

/** The steps and outcomes no scenario walks. */
export const CoverageNote: FC<{
  coverage?: ScenarioCoverage | null;
  names: Map<string, string>;
}> = ({ coverage, names }) => {
  if (!coverage) return null;
  const untried = Object.entries(coverage.untried_outcomes);
  if (!coverage.unexercised.length && !untried.length) {
    return (
      <p className="text-quaternary text-xs mb-2.5">
        {translate('The scenarios reach every enabled step.')}
      </p>
    );
  }
  return (
    <div className="text-xs mb-2.5" data-testid="scenario-coverage">
      {coverage.unexercised.length ? (
        <p className="mb-1">
          {translate('No scenario reaches: {steps}.', {
            steps: stepNames(coverage.unexercised, names),
          })}
        </p>
      ) : null}
      {untried.length ? (
        <p className="mb-0 text-quaternary">
          {translate('Outcomes no scenario takes: {outcomes}.', {
            outcomes: untried
              .map(
                ([key, outcomes]) =>
                  `${names.get(key) ?? key} (${outcomes.join(', ')})`,
              )
              .join('; '),
          })}
        </p>
      ) : null}
    </div>
  );
};
