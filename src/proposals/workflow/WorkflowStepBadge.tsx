import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from './queries';

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
      <Badge variant="outline-secondary" pill>
        {translate('Loading step…')}
      </Badge>
    );
  }

  if (!data || data.length === 0) return null;

  const visible = data.filter((s) => s.status !== 'skipped');
  if (visible.length === 0) return null;

  const active = visible.find((s) => s.status === 'active');
  const activeIndex = active ? visible.indexOf(active) : -1;

  if (active && activeIndex >= 0) {
    return (
      <Badge variant="outline-primary" pill>
        {translate('Step {current} of {total}: {name}', {
          current: activeIndex + 1,
          total: visible.length,
          name: active.step_name,
        })}
      </Badge>
    );
  }

  const completedCount = visible.filter((s) => s.status === 'completed').length;
  return (
    <Badge variant="outline-secondary" pill>
      {translate('{completed} of {total} steps complete', {
        completed: completedCount,
        total: visible.length,
      })}
    </Badge>
  );
};
