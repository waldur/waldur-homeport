import { ComplianceSummary } from '@/proposals/proposal/create/ComplianceSummary';
import { Proposal } from '@/proposals/types';
import { VStepperFormStepProps } from '@/wizard';

/** Read-only view of the applicant's compliance answers for the reviewer.
 *  Renders nothing when the checklist is not configured or the backend
 *  denies the viewer access to it. */
export const ReviewComplianceStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params?.proposal;
  return <ComplianceSummary proposal={proposal} id={props.id} />;
};
