import {
  CheckCircleIcon,
  ClockIcon,
  MinusCircleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { getStepDefinitions } from '@/proposals/workflow/constants';
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '@/proposals/workflow/queries';
import { renderFieldOrDash } from '@/table/utils';

interface WorkflowConfigurationWidgetProps {
  call: Call;
}

export const WorkflowConfigurationWidget: FC<
  WorkflowConfigurationWidgetProps
> = ({ call }) => {
  const { data: steps, refetch } = useQuery({
    queryKey: callWorkflowStepsKey(call.uuid),
    queryFn: () => fetchCallWorkflowSteps(call.uuid),
  });

  // FormTable.Card expects a () => void; the raw RQ refetch returns a
  // Promise<QueryObserverResult> (assignable but a type smell).
  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  const summary = useMemo(() => {
    const configured = new Map((steps ?? []).map((s) => [s.step, s]));
    const definitions = getStepDefinitions();
    const rows = definitions.map((def) => {
      const configuredStep = configured.get(def.id);
      const enabled = configuredStep?.is_enabled ?? false;
      const active = enabled || def.mandatory;
      return {
        id: def.id,
        name: def.name,
        active,
        duration: configuredStep?.duration_in_days ?? null,
      };
    });
    const enabledCount = rows.filter((r) => r.active).length;
    const totalDuration = rows
      .filter((r) => r.active && r.duration)
      .reduce((acc, r) => acc + (r.duration ?? 0), 0);
    return { rows, enabledCount, totalDuration, total: definitions.length };
  }, [steps]);

  return (
    <FormTable.Card
      title={translate('Workflow configuration')}
      className="card-bordered mb-6"
      refetch={handleRefetch}
    >
      <div className="d-flex flex-wrap gap-8 mb-5">
        <div>
          <div className="text-muted fs-7">{translate('Enabled steps')}</div>
          <div className="fs-2 fw-bold">
            {summary.enabledCount}/{summary.total}
          </div>
        </div>
        <div>
          <div className="text-muted fs-7">
            {translate('Total expected duration')}
          </div>
          <div className="fs-2 fw-bold">
            {renderFieldOrDash(
              summary.totalDuration > 0
                ? translate('{count} days', { count: summary.totalDuration })
                : null,
            )}
          </div>
        </div>
      </div>
      <FormTable>
        {summary.rows.map((row) => (
          <FormTable.Item
            key={row.id}
            label={
              <div className="d-flex align-items-center gap-2">
                {row.active ? (
                  <CheckCircleIcon
                    weight="fill"
                    className="text-success"
                    size={18}
                  />
                ) : (
                  <MinusCircleIcon
                    className="text-muted"
                    size={18}
                    weight="bold"
                  />
                )}
                <span className={row.active ? '' : 'text-muted'}>
                  {row.name}
                </span>
              </div>
            }
            value={renderFieldOrDash(
              row.active && row.duration ? (
                <span className="text-muted d-flex align-items-center gap-1">
                  <ClockIcon size={14} weight="bold" />
                  {translate('{count} days', { count: row.duration })}
                </span>
              ) : null,
            )}
          />
        ))}
      </FormTable>
    </FormTable.Card>
  );
};
