import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from './queries';
import { activeStepsOf } from './stages';

interface WorkflowStepBadgeProps {
  proposalUuid: string;
}

export const WorkflowStepBadge: FC<WorkflowStepBadgeProps> = ({
  proposalUuid,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposalUuid),
    queryFn: () => fetchProposalWorkflowStates(proposalUuid),
  });

  // Reserve space during the initial fetch so the proposal header doesn't
  // reflow once the badge resolves.
  if (isLoading) {
    return (
      <Badge variant="secondary" shape="pill" tone="outline">
        {translate('Loading step…')}
      </Badge>
    );
  }

  if (!data || data.length === 0) return null;

  const visible = data.filter((s) => s.status !== 'skipped');
  if (visible.length === 0) return null;

  // Steps of one stage run at once: the badge names all of them.
  const active = activeStepsOf(visible);
  const activeIndex = active.length ? visible.indexOf(active[0]) : -1;

  if (active.length && activeIndex >= 0) {
    return (
      <Badge variant="primary" shape="pill" tone="outline">
        {translate('Step {current} of {total}: {name}', {
          current: activeIndex + 1,
          total: visible.length,
          name: active.map((step) => step.step_name).join(' · '),
        })}
      </Badge>
    );
  }

  const completedCount = visible.filter((s) => s.status === 'completed').length;
  return (
    <Badge variant="secondary" shape="pill" tone="outline">
      {translate('{completed} of {total} steps complete', {
        completed: completedCount,
        total: visible.length,
      })}
    </Badge>
  );
};
