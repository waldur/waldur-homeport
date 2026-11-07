import { PlayIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { WorkflowDescription } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner, LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

import { OpenStep } from '../RoleMatrix';

import { CoverageNote, ScenarioCounts, ScenariosTable } from './CheckResults';
import { scenarioRows } from './checks';
import {
  callScenariosFinished,
  useCallScenarios,
  useRunCallScenarios,
} from './queries';

const useStepNames = (description?: WorkflowDescription) =>
  useMemo(
    () =>
      new Map((description?.steps ?? []).map((step) => [step.key, step.name])),
    [description],
  );

/** Calls ``onFinished`` once a run asked for has finished. */
const useRunFinished = (running: boolean, onFinished: () => void) => {
  const wasRunning = useRef(running);
  useEffect(() => {
    if (wasRunning.current && !running) {
      onFinished();
    }
    wasRunning.current = running;
  }, [running, onFinished]);
};

const CheckedAt: FC<{ checkedAt?: string | null; version?: number | null }> = ({
  checkedAt,
  version,
}) => (
  <span className="text-quaternary text-xs">
    {checkedAt
      ? translate('Checked {when} on version {version}', {
          when: formatDateTime(checkedAt),
          version: version ?? '—',
        })
      : translate('Not checked on the latest version yet.')}
  </span>
);

/**
 * A template's saved scenarios: each by name, what it is about and, expanded,
 * what it checks. Definitions only: they run on each call created from the
 * template, from the call's Validation page.
 */
export const TemplateScenariosPanel: FC<{
  scenarios: Array<Record<string, any>>;
  description?: WorkflowDescription;
}> = ({ scenarios, description }) => {
  const names = useStepNames(description);
  const rows = useMemo(() => scenarioRows(scenarios, undefined), [scenarios]);
  if (!rows.length) {
    return (
      <p className="text-quaternary mb-0" data-testid="template-scenarios">
        {translate('The template carries no saved scenarios.')}
      </p>
    );
  }
  return (
    <div data-testid="template-scenarios">
      <p className="text-quaternary text-xs">
        {translate(
          "These scenarios run on each call created from this template, from the call's Validation page.",
        )}
      </p>
      <ScenariosTable
        name="template-scenarios"
        rows={rows}
        loaded={scenarios}
        names={names}
        withResults={false}
      />
    </div>
  );
};

const NoTemplate = () => (
  <p className="text-quaternary mb-0">
    {translate(
      'This call was not created from a template, so it has no saved scenarios to check.',
    )}
  </p>
);

/**
 * The scenarios of the template the call was created from, with how they
 * went when last run on the call; those who configure the call run them.
 */
export const CallScenariosPanel: FC<{
  callUuid: string;
  description: WorkflowDescription;
  canRun: boolean;
  onOpenStep?: OpenStep;
}> = ({ callUuid, description, canRun, onOpenStep }) => {
  const names = useStepNames(description);
  const { data, isLoading, isError, dataUpdatedAt } =
    useCallScenarios(callUuid);
  const run = useRunCallScenarios(callUuid);
  const { showErrorResponse } = useNotify();
  const running = data?.status === 'running';
  const client = useQueryClient();
  const onFinished = useCallback(
    () => callScenariosFinished(client, callUuid),
    [client, callUuid],
  );
  useRunFinished(running, onFinished);
  const rows = useMemo(
    () => scenarioRows(data?.scenarios, data?.results),
    [data?.scenarios, data?.results],
  );
  if (isLoading) return <LoadingSpinner />;
  if (isError || !data) {
    return (
      <p className="text-danger mb-0">
        {translate('The scenarios could not be loaded.')}
      </p>
    );
  }
  if (!data.template) return <NoTemplate />;
  if (!data.scenarios.length) {
    return (
      <p className="text-quaternary mb-0">
        {translate('The template carries no saved scenarios.')}
      </p>
    );
  }
  return (
    <div data-testid="call-scenarios">
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
        <div className="flex flex-col gap-1">
          <ScenarioCounts
            count={rows.length}
            totals={data.checked_at ? data.totals : null}
          />
          {data.checked_at ? (
            <CheckedAt checkedAt={data.checked_at} version={data.version} />
          ) : (
            <span className="text-quaternary text-xs">
              {translate('From the template {name}', {
                name: data.template.name,
              })}
            </span>
          )}
          {running && (
            <span
              className="text-quaternary text-xs flex items-center gap-1.5"
              data-testid="call-scenarios-running"
            >
              <LoadingSpinnerSimple size={16} />
              {translate(
                'Running the scenarios. The results below refresh when they are done.',
              )}
            </span>
          )}
          {!running && data.error && (
            <span
              className="text-warning text-xs"
              data-testid="call-scenarios-error"
            >
              {data.error}
            </span>
          )}
        </div>
        {canRun && (
          <BaseButton
            variant="secondary"
            size="lg"
            label={running ? translate('Running…') : translate('Run scenarios')}
            iconNode={<PlayIcon weight="bold" />}
            pending={run.isPending || running}
            disabled={running}
            disabledReason={translate('The scenarios are running.')}
            onClick={() =>
              run.mutate(undefined, {
                onError: (error) =>
                  showErrorResponse(
                    error,
                    translate('The scenarios did not run.'),
                  ),
              })
            }
          />
        )}
      </div>
      <p className="text-quaternary text-xs">
        {translate(
          'Each scenario is a dry run on a synthetic proposal: nothing is sent and nothing is kept.',
        )}
      </p>
      <CoverageNote coverage={data.coverage} names={names} />
      <ScenariosTable
        name={`call-scenarios-${callUuid}`}
        rows={rows}
        loaded={dataUpdatedAt}
        names={names}
        withResults
        onOpenStep={onOpenStep}
      />
    </div>
  );
};
