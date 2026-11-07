import { FC, useMemo } from 'react';
import { CallStepKindEnum, CallTemplateStep } from 'waldur-js-client';

import { translate } from '@/i18n';
import { WorkflowSequencePreview } from '@/proposals/update/workflow-steps/WorkflowSequencePreview';
import { kindLabel } from '@/proposals/workflow/constants';
import { useWorkflowStepKinds } from '@/proposals/workflow/queries';
import { useTemplateWorkflowDescription } from '@/proposals/workflow-description/queries';
import {
  formatStepSummary,
  fromDescription,
} from '@/proposals/workflow-description/summary';

/**
 * The workflow a call created from a template starts with, each step with
 * the sentence the call's step list will show for it.
 */
export const CallTemplateStepsPreview: FC<{
  steps: CallTemplateStep[];
  templateUuid?: string;
}> = ({ steps, templateUuid }) => {
  const { data: kinds } = useWorkflowStepKinds();
  const { data: description } = useTemplateWorkflowDescription(templateUuid);
  const sequence = useMemo(
    () =>
      steps.map((step, index) => ({
        uuid: String(index),
        name: step.name,
        order: step.order ?? index,
        is_enabled: step.is_enabled,
        kind: (step.kind ?? undefined) as CallStepKindEnum | undefined,
      })),
    [steps],
  );
  return (
    <WorkflowSequencePreview
      steps={sequence}
      title={translate('Workflow')}
      description={translate(
        'The enabled steps of the template, in the order proposals go through them.',
      )}
      renderDetails={(step) =>
        step.kind ? (
          <div className="text-quaternary text-xs mt-1">
            {kindLabel(kinds, step.kind)}
          </div>
        ) : null
      }
      describe={(step) => {
        const described = description?.steps.find(
          (candidate) => candidate.order === step.order,
        );
        return described && description
          ? {
              description: formatStepSummary(
                fromDescription(described, description),
              ),
            }
          : null;
      }}
    />
  );
};
