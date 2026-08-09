import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { StepEnum } from 'waldur-js-client';

import { DASH_ESCAPE_CODE } from '@/table/constants';

import {
  responsibleRoleLabel,
  stepDefinition,
  stepLabel,
} from '../workflow/constants';
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '../workflow/queries';

/**
 * Which step a proposal is sitting on, and who owes the next move.
 *
 * A queue of eleven proposals is unreadable without it: the state badge says
 * "In review" for every one of them, whether the call manager owes an
 * eligibility check or a reviewer owes a score.
 *
 * The role comes from the call's own configuration where it has one, since a
 * call may reassign a step away from the catalogue default.
 */
export const ProposalStepCell: FC<{
  callUuid: string;
  step: StepEnum | null | undefined;
}> = ({ callUuid, step }) => {
  const { data: steps } = useQuery({
    queryKey: callWorkflowStepsKey(callUuid),
    queryFn: () => fetchCallWorkflowSteps(callUuid),
    staleTime: 5 * 60 * 1000,
  });

  const role = useMemo(() => {
    if (!step) return undefined;
    const configured = (steps || []).find((item) => item.step === step);
    return (
      configured?.responsible_role ??
      stepDefinition(step)?.defaultResponsibleRole
    );
  }, [steps, step]);

  // No step means no workflow is running on this proposal — a draft, or a call
  // that enables no steps at all. Saying "—" is honest; naming a step is not.
  if (!step) {
    return <>{DASH_ESCAPE_CODE}</>;
  }

  return (
    <div className="d-flex flex-column">
      <span>{stepLabel(step)}</span>
      {role ? (
        <span className="text-muted fs-7">{responsibleRoleLabel(role)}</span>
      ) : null}
    </div>
  );
};
