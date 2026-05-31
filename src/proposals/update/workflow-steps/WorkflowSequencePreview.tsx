import { CircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  CallWorkflowStep,
  ResponsibleRoleEnum,
  StepEnum,
} from 'waldur-js-client';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import {
  getStepDefinitions,
  responsibleRoleLabel,
  TransitionModeEnum,
  transitionModeLabel,
} from '@/proposals/workflow/constants';

import './WorkflowSequencePreview.scss';

interface WorkflowSequencePreviewProps {
  steps: CallWorkflowStep[];
  onReset?(): void;
}

export const WorkflowSequencePreview: FC<WorkflowSequencePreviewProps> = ({
  steps,
  onReset,
}) => {
  const orderedActiveSteps = useMemo(() => {
    const byId = new Map<StepEnum, CallWorkflowStep>(
      steps.map((s) => [s.step, s]),
    );
    const definitions = getStepDefinitions();
    const catalogOrder = new Map(definitions.map((d, i) => [d.id, i]));
    return definitions
      .filter((def) => {
        const configured = byId.get(def.id);
        return configured?.is_enabled || def.mandatory;
      })
      .map((def) => ({
        definition: def,
        configured: byId.get(def.id),
      }))
      .sort((a, b) => {
        const aOrder =
          a.configured?.display_order ??
          catalogOrder.get(a.definition.id) ??
          99;
        const bOrder =
          b.configured?.display_order ??
          catalogOrder.get(b.definition.id) ??
          99;
        return aOrder - bOrder;
      });
  }, [steps]);

  if (orderedActiveSteps.length === 0) {
    return null;
  }

  return (
    <FormTable.Card
      title={translate('Preview sequence')}
      className="card-bordered"
      refetch={onReset}
    >
      <p className="text-muted fs-7 mb-5">
        {translate(
          'Shows the workflow as configured in the steps above. Appears once at least one optional step is enabled.',
        )}
      </p>
      <div
        className="workflow-sequence"
        style={{
          gridTemplateColumns: `repeat(${orderedActiveSteps.length}, 1fr)`,
        }}
      >
        {orderedActiveSteps.map(({ definition, configured }, index) => (
          <div key={definition.id} className="workflow-sequence__node">
            {index < orderedActiveSteps.length - 1 && (
              <span className="workflow-sequence__connector" />
            )}
            <span className="workflow-sequence__bullet">
              <CircleIcon
                weight="fill"
                size={10}
                className="text-muted d-block"
              />
            </span>
            <div className="mt-3 fw-medium small text-gray-700">
              {definition.name}
            </div>
            <div className="text-muted fs-8 mt-1">
              {configured?.duration_in_days
                ? translate('{count}d', {
                    count: configured.duration_in_days,
                  })
                : translate('No deadline')}
            </div>
            {configured?.responsible_role ? (
              <div className="text-muted fs-8">
                {responsibleRoleLabel(
                  configured.responsible_role as ResponsibleRoleEnum | null,
                )}
              </div>
            ) : null}
            <div className="text-muted fs-8">
              {transitionModeLabel(
                (configured?.transition_mode ||
                  'automatic_on_completion') as TransitionModeEnum,
              )}
            </div>
          </div>
        ))}
      </div>
    </FormTable.Card>
  );
};
